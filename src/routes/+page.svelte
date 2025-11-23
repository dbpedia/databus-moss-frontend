<script lang="ts">
	import SearchResult from '$lib/components/search-result.svelte';
	import { MossUtils } from '$lib/utils/moss-utils';

	import type { FacetConfig, SearchConfig, SearchTag } from '$lib/types';
	import LookupFacet from '$lib/components/lookup-facet.svelte';
	import LiteralFacet from '$lib/components/literal-facet.svelte';

	const INNER_SELECT_TEMPLATE = `
		SELECT DISTINCT ?s WHERE 
		{
			%SELECTOR%
		}
	`;

	const UNION_BLOCK_TEMPLATE = `
		{
			VALUES ?t { %VALUES% } ?s <%PREDICATE%> ?t .
		}
	`;

	const SELECT_QUERY_TEMPLATE = `
		SELECT DISTINCT ?s ?e ?g ?t WHERE 
		{
			{
				%INNER_SELECT%
			}

			?e <http://dataid.dbpedia.org/ns/moss#extends> ?s .
			?e <http://dataid.dbpedia.org/ns/moss#content> ?g .

			GRAPH ?g {
				%UNION_BLOCKS%
			}
		}
	`;

	let facetSelections: Record<string, SearchTag[]> = {};
	let sparqlSelector: string;

	const keywordFacet: FacetConfig = {
		id: 'keyword',
		label: 'Keywords',
		lookupBaseUrl: 'http://localhost:5173/api/v1/search?label=',
		module: 'http://localhost:8080/modules/keyword',
		predicate: 'https://schema.org/keywords',
		labelField: 'label',
		isLiteral: true
	};

	const locationFacet: FacetConfig = {
		id: 'location',
		label: 'Location',
		lookupBaseUrl: 'https://lookup.dbpedia.org/api/search?format=JSON&typeName=Location&query=',
		module: 'http://localhost:8080/modules/oem-spatial',
		predicate: 'http://purl.org/dc/terms/spatial',
		labelField: 'label',
		isLiteral: false
	};

	const fundingAgencyFacet: FacetConfig = {
		id: 'fundingAgency',
		label: 'Funding Agency',
		module: 'http://localhost:8080/modules/oem-project',
		lookupBaseUrl: 'http://localhost:5173/terminologies/reorg/search?query=',
		predicate: 'https://dbpedia.org/ns/oem/fundingAgency',
		labelField: 'label',
		isLiteral: false
	};

	const oeoAnnotationFacet: FacetConfig = {
		id: 'oeoAnnotation',
		label: 'Referenced Concepts',
		module: 'http://localhost:8080/modules/oemeta',
		lookupBaseUrl: 'http://localhost:5173/terminologies/oeo/search?query=',
		predicate: 'http://dataid.dbpedia.org/ns/moss#related',
		labelField: 'label',
		isLiteral: false
	};

	const facetMap: Record<string, FacetConfig> = {
		[locationFacet.id]: locationFacet,
		[fundingAgencyFacet.id]: fundingAgencyFacet,
		[oeoAnnotationFacet.id]: oeoAnnotationFacet,
		[keywordFacet.id]: keywordFacet
	};

	function formatValue(v: string, isLiteral: boolean) {
		if (isLiteral) return `"${v.replace(/"/g, '\\"')}"`;
		return `<${v}>`;
	}

	function crateInnerSelectClause(): string {
		let selectorString: string = '';

		for (const [module, selection] of Object.entries(facetSelections)) {
			if (!selection || selection.length === 0) continue;

			const predicate = facetMap[module]?.predicate;
			const isLiteral = facetMap[module]?.isLiteral;

			for (var s of selection) {
				selectorString += `?s <${predicate}> ${formatValue(s.id, isLiteral)} .\n`;
			}
		}

		return selectorString;
	}

	function createSelectQuery(): string {
		if (!sparqlSelector || Object.keys(facetSelections).length === 0) return '';

		const facets = Object.entries(facetSelections)
			.filter(([id, tags]) => tags.length > 0 && facetMap[id])
			.map(([id, tags]) => ({
				predicate: facetMap[id]!.predicate,
				values: tags.map((t) => `${formatValue(t.id, facetMap[id]!.isLiteral)}`)
			}));

		if (facets.length === 0) return '';

		const unionBlocks = facets
			.map((f) =>
				UNION_BLOCK_TEMPLATE.replace('%VALUES%', f.values.join(' ')).replace(
					'%PREDICATE%',
					f.predicate
				)
			)
			.join('\n    UNION\n    ');

		const innerSelect = INNER_SELECT_TEMPLATE.replace('%SELECTOR%', sparqlSelector.trim());

		return SELECT_QUERY_TEMPLATE.replace('%INNER_SELECT%', innerSelect)
			.replace('%UNION_BLOCKS%', unionBlocks)
			.trim();
	}

	async function updateSelection() {
		queryString = createSelectQuery();

		const response = await fetch('/sparql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/sparql-query',
				Accept: 'application/json'
			},
			body: queryString
		});

		const data = await response.json();
		var results: any = {};

		for (const result of data.results.bindings) {
			// Databus resource
			const databusUri = result.s.value;

			if (results[databusUri] == undefined) {
				results[databusUri] = {
					uri: databusUri,
					name: MossUtils.uriToName(databusUri),
					entries: {},
					hash: databusUri
				};
			}

			const entryUri = result.e.value;

			if (results[databusUri].entries[entryUri] == undefined) {
				results[databusUri].entries[entryUri] = {
					uri: entryUri,
					name: MossUtils.uriToName(entryUri),
					contentUri: result.g.value,
					browseLink: MossUtils.getRelativeUri(result.e.value),
					explanations: []
				};
			}

			results[databusUri].entries[entryUri].explanations.push({
				uri: result.t.value,
				label: MossUtils.uriToName(result.t.value)
			});
		}

		// Trigger Svelte reactivity
		searchResults = results;
	}

	function onFacetChange(event: CustomEvent<{ id: string; selection: SearchTag[] }>) {
		facetSelections[event.detail.id] = event.detail.selection;

		// Create the selector here:
		sparqlSelector = crateInnerSelectClause();

		updateSelection();
	}

	sparqlSelector = crateInnerSelectClause();

	let queryString: string = '';

	let baseUrl = `/api/v1/search?query=`;
	let joinSuffix = `&join=`;
	let joinField = 'annotation';

	let searchResults: { [key: string]: any };
	let annotationTags: any;

	annotationTags = [];
	searchResults = {};

	let searchInput: string;
	searchInput = '';

	let isSearching = false;

	async function query(searchInput: string, join?: string) {
		let query = `${baseUrl}${searchInput}`;
		if (join != null) {
			query += joinSuffix + join;
		}

		const data = await fetch(query);
		return (await data.json()) ?? [];
	}

	function generateSearchExplanation(doc: any, searchTerm: string): any {
		let matchedFields: any = {};

		// Check each field in the document for the <B> tags indicating a match.
		for (const [field, value] of Object.entries(doc)) {
			if (!Array.isArray(value)) {
				continue;
			}

			for (let val of value) {
				if (!val.includes('<B>')) {
					continue;
				}

				if (matchedFields[field] == undefined) {
					matchedFields[field] = [];
				}

				matchedFields[field].push({ label: val });
			}
		}

		return matchedFields;
	}

	function createHash(input: string) {
		// In a real application, consider using a library like 'crypto-js' or the SubtleCrypto API
		let hash = 0;
		for (let i = 0; i < input.length; i++) {
			hash = (hash << 5) - hash + input.charCodeAt(i);
			hash = hash | 0; // Convert to 32bit integer
		}
		return hash.toString();
	}
</script>

<div class="section">
	<div class="container">
		<div class="columns">
			<div class="column">
				<!--
				<pre
					style="font-size: 0.7em; max-width: 800px; overflow-x:scroll; background-color:#f8f8f8">
					{sparqlSelector}
				</pre>
-->
				<pre
					style="font-size: 0.7em; max-width: 800px; overflow-x:scroll; background-color:#f8f8f8">
					{queryString}
				</pre>

				<ul>
					{#if isSearching}
						<p>Searching...</p>
					{/if}
					{#each Object.entries(searchResults) as [key, result] (result.hash)}
						<li>
							<SearchResult data={result} />
						</li>
					{/each}
				</ul>
			</div>
			<div class="column medium">
				<LiteralFacet config={keywordFacet} {sparqlSelector} on:selectionChanged={onFacetChange} />
				<LookupFacet config={locationFacet} {sparqlSelector} on:selectionChanged={onFacetChange} />

				<LookupFacet
					config={fundingAgencyFacet}
					{sparqlSelector}
					on:selectionChanged={onFacetChange}
				/>

				<LookupFacet
					config={oeoAnnotationFacet}
					{sparqlSelector}
					on:selectionChanged={onFacetChange}
				/>

				<!--

					
				<h2>Keyword</h2>
				<Input
					bind:value={searchInput}
					on:keyup={onSearchInputChanged}
					placeholder="Search files..."
				/>

				<h2>Location</h2>
				<div class="facet-input" style="margin-bottom: .5rem;">
					<LookupSearch
						lookupBaseUrl={locationWidgetConfig.lookupBaseUrl}
						sparqlDistinctQuery={locationWidgetConfig.countQuery}
						labelField="label"
						on:select={(e) => {
							locationWidgetConfig.selection = [...locationWidgetConfig.selection, e.detail];
							onSelectionChanged(locationWidgetConfig, locationWidgetConfig.selection);
						}}
					/>
				</div>
				<TagList bind:items={locationWidgetConfig.selection} />

				<h2>OEO Annotation</h2>
				<div class="facet-input" style="margin-bottom: .5rem;">
					<LookupSearch
						lookupBaseUrl={annotationWidgetConfig.lookupBaseUrl}
						sparqlDistinctQuery={annotationWidgetConfig.countQuery}
						labelField="label"
						on:select={(e) => {
							annotationWidgetConfig.selection = [...annotationWidgetConfig.selection, e.detail];
							onSelectionChanged(annotationWidgetConfig, annotationWidgetConfig.selection);
						}}
					/>
				</div>
				<TagList bind:items={annotationWidgetConfig.selection} />

				<h2>Funding Agency</h2>
				<div class="facet-input" style="margin-bottom: .5rem;">
					<LookupSearch
						lookupBaseUrl={fundingAgencyWidgetConfig.lookupBaseUrl}
						sparqlDistinctQuery={fundingAgencyWidgetConfig.countQuery}
						labelField="label"
						on:select={(e) => {
							fundingAgencyWidgetConfig.selection = [
								...fundingAgencyWidgetConfig.selection,
								e.detail
							];
							onSelectionChanged(fundingAgencyWidgetConfig, fundingAgencyWidgetConfig.selection);
						}}
					/>
				</div>
				<TagList bind:items={fundingAgencyWidgetConfig.selection} />

			
				<h2>Publication Date</h2>
				<div class="facet-input">
					<Input
						type="datetime-local"
						bind:value={publicationDateStart}
						placeholder="Start time"
						on:change={onSearchInputChanged}
					/>
				</div>
				<div class="facet-input">
					<Input
						type="datetime-local"
						bind:value={publicationDateEnd}
						placeholder="End time"
						on:change={onSearchInputChanged}
					/>
				</div>

				<h2>Grant No</h2>
				<div class="facet-input">
					<Input
						type="text"
						bind:value={grantNo}
						placeholder="Grant No"
						on:change={onSearchInputChanged}
					/>
				</div>

				<h2>Publisher Contact</h2>
				<div class="facet-input">
					<Input
						type="text"
						bind:value={publisherEmail}
						placeholder="Publisher Contact Email"
						on:change={onSearchInputChanged}
					/>
				</div>

				<h2>License URI</h2>
				<div class="facet-input">
					<Input
						type="text"
						bind:value={licenseUri}
						placeholder="License URI"
						on:change={onSearchInputChanged}
					/>
				</div>

				<h2>Data Format</h2>
				<div class="facet-input">
					<Input
						type="text"
						bind:value={format}
						placeholder="Data Format"
						on:change={onSearchInputChanged}
					/>
				</div>

				<h2>Reference Date</h2>
				<div class="facet-input">
					<Input
						type="datetime-local"
						bind:value={referenceDateStart}
						placeholder="Start time"
						on:change={onSearchInputChanged}
					/>
				</div>
				<div class="facet-input">
					<Input
						type="datetime-local"
						bind:value={referenceDateEnd}
						placeholder="End time"
						on:change={onSearchInputChanged}
					/>
				</div>

				<h2>Ontology Annotations</h2>
				<AnnotationSearch on:annotationClick={onAnnotationClicked}></AnnotationSearch>
				-->
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	.column {
		padding-right: 2em;
	}

	.column.medium {
		min-width: 256px;
		width: 256px;
	}
</style>
