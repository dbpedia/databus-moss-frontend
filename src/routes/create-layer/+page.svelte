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

	export let data : any;
	let layerTestName = '';
	let resourceTestName = '';
	let layerName: string = layerTestName;
	let databusResource: string = resourceTestName;
	let layerList: any;

	let errorMessage: string = '';
	let activeLayer: any = null;

	
	function onLayerChange() {
		activeLayer = data.props.layers.find((layer: any) => layer.name == layerName);
	}

	async function createLayer() {
		// Get the document and see if it exists
		var layer = data.props.layers.find((layer: any) => layer.name == layerName);

		if(layer == undefined) {
			return;
		}

		
		let documentMossPath = MossUtils.getDocumentUri(databusResource, layer.name, layer.formatExtension);
		let documentUri = `/g/content/${documentMossPath}`;
		let getResponse = await fetch(env.PUBLIC_MOSS_BASE_URL + documentUri);

		if (getResponse.status == 200) {
			errorMessage = `Layer already exists. (${documentUri})`;
			return;
		}

		errorMessage = '';
		const saveURL = MossUtils.getSaveRequestURL(databusResource, layerName);

		console.log(saveURL);
		let body = "";

		try {
			let templateResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers/get-template?layerName=${layer.name}`);

			if (templateResponse.status == 200) {
				
				let templateContent = await templateResponse.text();
				body = templateContent.replace(new RegExp(databusResourcePlaceholder, 'g'), databusResource);
			}
		} catch(e : any) {
			console.log(e);
		}
		
		try {
			const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + saveURL, 'POST', body, layer.format);

			if (response.status == 200) {
				goto(documentUri.replace('/g/content/', '/browse/'));
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

	layerList = data.props.layers.map((layer: any) => {
		return {
			value: layer.name,
			name: layer.name
		};
	});


</script>

<div class="section">
	<div class="settings container">
		{#if data.props.userData?.username}
			<h1>Create Layer</h1>
			<div class="setting">
				<h2>Layer Name</h2>
				<div>
					<Select bind:value={layerName} items={layerList} on:change={onLayerChange} />
				</div>
				<div class="explanation">The name of the layer. The admin of the MOSS instance can add more layer types.</div>
			</div>
			{#if activeLayer}
				<h2>Layer Info</h2>
				<table class="layer-info">
					<tr>
						<td>Resource Type(s)</td>
						<td>
							{#each activeLayer.resourceTypes as resourceType}
								<div><a href="{resourceType}" target="_blank">{resourceType}</a></div>
							{/each}
						</td>
					</tr>
					<tr>
						<td>Format</td>
						<td>{ activeLayer.format }</td>
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
				{#if data.props.userData}
					<Heading tag="h3" class="mb-4">
						<Span gradient>Specify a username in the account settings to create a layer!</Span>
					</Heading>
				{:else}
					<Heading tag="h3" class="mb-4">
						<Span gradient>Login required to a create layer!</Span>
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
