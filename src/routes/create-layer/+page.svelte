<script lang="ts">
	import { goto } from '$app/navigation';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { Input, Button, Select, Heading, Span, GradientButton } from 'flowbite-svelte';
	import { env } from '$env/dynamic/public'

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { RdfFormats } from '$lib/utils/rdf-formats.js';

	const databusResourcePlaceholder: string = '%DATABUS_RESOURCE%';
	const buttonName: string = 'Create Layer';

	export let data;
	let layerTestName = 'simple';
	let resourceTestName = 'https://databus.openenergyplatform.org/hu_wu/test_group';
	let layerName: string = layerTestName;
	let databusResource: string = resourceTestName;
	let layerList: any;

	let errorMessage: string = '';

	async function createLayer() {
		// Get the document and see if it exists
		var layer = data.props.layers.find((layer: any) => layer.name == layerName);

		if(layer == undefined) {
			return;
		}

		
		let documentMossPath = MossUtils.getDocumentUri(databusResource, layer.name, layer.format);
		let documentUri = `/g/content/${documentMossPath}`;
		let getResponse = await fetch(env.PUBLIC_MOSS_BASE_URL + documentUri);

		if (getResponse.status == 200) {
			errorMessage = `Layer already exists. (${documentUri})`;
			return;
		}

		errorMessage = '';
		const saveURL = MossUtils.getSaveRequestURL(databusResource, layerName);

		console.log(saveURL);
		
		let format = RdfFormats.getFormatByExtension(layer.format);
		const content = layer.template;

		let body = content
			.replace(databusResourcePlaceholder, databusResource);

		const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + saveURL, 'POST', body, format.contentType);

		if (response.status == 200) {
			goto(documentUri.replace('/g/content/', '/browse/'));
		}

		return response;
	}

	layerList = data.props.layers.map((layer: any) => {
		return {
			value: layer.name,
			name: layer.name
		};
	});

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

			<GradientButton color="cyanToBlue" name={buttonName} on:click={createLayer}>{buttonName}</GradientButton>
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
	.sign-in {
		display: flex;
		flex-direction: column;
		text-align: center;
	}
</style>
