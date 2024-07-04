<script lang="ts">
	import { goto } from '$app/navigation';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { Input, Label, Button, Select, Heading, Span } from 'flowbite-svelte';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const layerPlaceholder: string = '%LAYERNAME%';
	const databusResourcePlaceholder: string = '%DATABUSRESOURCE%';
	const buttonName: string = 'Create Layer';

	export let data;
	let layerTestName = 'simple';
	let resourceTestName = 'https://databus.openenergyplatform.org/hu_wu/test_group/';
	let layerName: string = layerTestName;
	let databusResource: string = resourceTestName;
	let layerList: any = data.props.layers;
	let errorMessage: string = '';

	async function postDocument() {
		// Get the document and see if it exists
		let documentMossPath = MossUtils.getDocumentUri(databusResource, layerName);
		let documentUri = `/g/${documentMossPath}`;

		let getResponse = await fetch(documentUri);

		if (getResponse.status == 200) {
			errorMessage = `Layer already exists. (${documentUri})`;
			return;
		}

		errorMessage = '';
		const saveURL = MossUtils.getSavePath(databusResource, layerName);

		const content = `{
            "@context" : "https://raw.githubusercontent.com/dbpedia/databus-moss/dev/devenv/context2.jsonld",
            "@id" : "${databusResourcePlaceholder}",
            "isExtendedBy" :  {
                "@id" : "#layer",
                "@type" : "DatabusMetadataLayer",
                "layerName": "${layerPlaceholder}",
                "created" : "2024-03-01 14:37:32"
            }
        }`;

		let body = content
			.replace(layerPlaceholder, layerName)
			.replace(databusResourcePlaceholder, databusResource);

		const response = await fetchAuthorized(saveURL, 'POST', body);

		if (response.status == 200) {
			goto(documentUri.replace('/g/', '/browse/'));
		}

		return response;
	}

	layerList = layerList.map((layer: string) => {
		return {
			value: layer,
			name: layer
		};
	});

	async function fetchAuthorized(uri: string, method: string, body: any): Promise<Response> {
		let session = $page.data.session as any;

		if (!session || !session.accessToken) {
			return Response.error();
		}

		let headers: any = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + session.accessToken
		};

		return fetch(uri, {
			method: method,
			headers: headers,
			body: body
		});
	}

	onMount(async () => {
		const session = $page.data.session;
		const user = $page.data.session?.user;

	})
</script>

<div class="section">
	<div class="settings container">
		{#if $page.data.session?.user}
			<h1>Create Layer</h1>
			<div class="setting">
				<h2>Layer Name</h2>
				<div>
					<Select bind:value={layerName} items={layerList} />
				</div>
				<div class="explanation">The name of the layer. The admin of the MOSS instance can add more layer types.</div>
			</div>
			<div class="setting">
				<h2>Databus Resource</h2>
				<Input
				bind:value={databusResource}
				class="input"
				placeholder={databusResourcePlaceholder}/>
				<div class="explanation">Any Databus resource that should be described by the layer.</div>
			</div>

			<Button name={buttonName} on:click={postDocument}>{buttonName}</Button>
			{#if errorMessage}
				{errorMessage}
			{/if}
		{:else}
			<div class="sign-in">
				<Heading tag="h3" class="mb-4">
					<Span gradient>Login required to a create layer!</Span>
				</Heading>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		align-items: center;
		padding-bottom: 3px;
		padding-top: 3px;
		padding-left: 1em;
		gap: 10px;
		flex-wrap: nowrap;
		margin-top: 20px;
	}

	.sign-in {
		display: flex;
		flex-direction: column;
		text-align: center;
	}

</style>
