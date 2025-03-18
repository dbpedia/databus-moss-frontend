<script lang="ts">
	import { goto } from '$app/navigation';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { Input, Button, Select, Heading, Span, GradientButton } from 'flowbite-svelte';
	import { env } from '$env/dynamic/public'

	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { RdfUris } from '$lib/utils/rdf-uris';

	const buttonName: string = 'Create Entry';

	let layerTestName = '';
	let resourceTestName = '';
	let layerId: string = layerTestName;
	let databusResource: string = resourceTestName;
	let content: string = '';
	let layerList: any;

	let errorMessage: string = '';
	let activeLayer: any = null;

	let layerFormat = writable<string|null>(null);
	let graphList = MossUtils.getGraphList($page.data.layers);
	
	
	async function onLayerChange() {
		activeLayer = $page.data.layers[RdfUris.JSONLD_GRAPH].find((layer: any) => layer[RdfUris.JSONLD_ID] === layerId);
		layerFormat.set(activeLayer?.formatMimeType);

	}

	async function createLayer() {

		let graphList = MossUtils.getGraphList($page.data.layers);

		// Get the document and see if it exists
		var layer = graphList.find((layer: any) => layer[RdfUris.JSONLD_ID] === layerId);

		if(layer == undefined) {
			errorMessage = `No such layer found.`;
			return;
		}

		let layerURI = MossUtils.getLayerURI(env.PUBLIC_MOSS_BASE_URL, databusResource, layer[RdfUris.JSONLD_ID]);
		let getResponse = await fetch(layerURI);

		if (getResponse.status == 200) {
			errorMessage = `Layer already exists. (${layerURI})`;
			return;
		}

		errorMessage = '';
		
		
		try {
			const saveURL = MossUtils.getSaveRequestURL(databusResource, layerId);
			const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + saveURL, 'POST', null, layer.formatMimeType);

			if (response.status == 200) {
				var responseData = await response.json();

				console.log(responseData);
				 goto(`/browse/${responseData.path}`);
			}
			else {
				let responseBody = await response.json();
				errorMessage = responseBody.message;
			}
		} catch(e : any) {
			console.log(e);
			errorMessage = e.message;
		}
	}

	
	layerList = graphList.map((layer: any) => {
		return {
			value: layer[RdfUris.JSONLD_ID],
			name: layer[RdfUris.JSONLD_ID]
		};
	});


</script>

<div class="section">
	<div class="settings container">
		{#if $page.data.userData}
			<h1>Create Entry</h1>
			<div class="setting">
				<h2>Layer Type</h2>
				<div>
					<Select bind:value={layerId} items={layerList} on:change={onLayerChange} />
				</div>
				<div class="explanation">The name of the layer. The admin of the MOSS instance can add more layer types.</div>
			</div>
			{#if activeLayer}
				<table class="layer-info">
					<!--
					<tr>
						<td>Resource Type(s)</td>
						<td>
							{#each activeLayer.resourceTypes ?? [] as resourceType}
								<div><a href="{resourceType}" target="_blank">{resourceType}</a></div>
							{/each}
						</td>
					</tr>-->
					<tr>
						<td>Format</td>
						<td>{ activeLayer.formatMimeType }</td>
					</tr>
					{#if activeLayer.hasTemplate}
					<tr>
						<td>Template</td>
						<td><a target="_blank" href="{env.PUBLIC_MOSS_BASE_URL}/api/layers/get-template?layerName={activeLayer.name}">View Template</a></td>
					</tr>
					{/if}
					{#if activeLayer.hasSHACL}
					<tr>
						<td>SHACL</td>
						<td><a target="_blank" href="{env.PUBLIC_MOSS_BASE_URL}/api/layers/get-shacl?layerName={activeLayer.name}">View SHACL</a></td>
					</tr>
					{/if}
					
				</table>
			{/if}
			<div class="setting">
				<h2>Databus Resource</h2>
				<Input
				bind:value={databusResource}
				class="input"
				placeholder="Databus Resource URI"/>
				<div class="explanation">Any Databus resource that should be described by the layer.</div>
			</div>



			<GradientButton color="cyanToBlue" name={buttonName} on:click={createLayer}>{buttonName}</GradientButton>
			{#if errorMessage}
			<div class="error-box" style="margin-top: 1em">
				{@html errorMessage}
			</div>
			{/if}
		{:else}
			<div class="sign-in">
				{#if !$page.data.userData}
					<Heading tag="h3" class="mb-4">
						<Span gradient>Specify a username in the account settings to create a layer!</Span>
					</Heading>
				{:else}
					<Heading tag="h3" class="mb-4">
						<Span gradient>Login required to a create metadata!</Span>
					</Heading>
				{/if}
				
			</div>
		{/if}
	</div>
</div>

<style>
.sign-in {
	display: flex;
	flex-direction: column;
	text-align: center;
}

.layer-info {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 2em;
}

.layer-info td {
	padding: 8px;
	text-align: left;
	border: 1px solid #ddd;
}

.layer-info a {
	color:cadetblue;
	text-decoration: underline;
}

.error-box {
	padding: 1em 1.5em; 
	background-color: #f8d7da;
	color: #721c24;
	border: 1px solid #f5c6cb;
	border-radius: 8px;
	margin-bottom: 1em;
}
</style>
