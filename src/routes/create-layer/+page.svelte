<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import CodeMirror from "$lib/components/code-mirror.svelte";
	import SaveButton from '$lib/components/save-button.svelte';
    import { EditorView } from "@codemirror/view";
	import CreateFile from '$lib/components/create-file.svelte';
	import { FileMusicOutline } from 'flowbite-svelte-icons';
    import { MossUtils } from '$lib/utils/moss-utils';

    let databusResourcePlacehodler: string = "%DATABUSRESOURCE%";
    let layerNamePlacehodler: string = "$LAYERNAME%";

    let layerName: string;
    let databusResource : string;

    const layerTemplate = `{
        "@context" : "https://raw.githubusercontent.com/dbpedia/databus-moss/dev/devenv/context2.jsonld",
        "@id" : "%DATABUSRESOURCE%",
        "isExtendedBy" :  {
            "@id" : "#layer",
            "@type" : "DatabusMetadataLayer",
            "name": "%LAYERNAME%",
            "created" : "2024-03-01 14:37:32"
        },
        "subject" : [ "oeo:OEO_00020033" ]
    }`


    let buttonName = "Create Layer";

    async function onCreateButtonClicked() {

        // TASK 1: FINDE DEN PATH HERAUS
        let documentUri = MossUtils.getDocumentUri(databusResource, layerName);

        alert(documentUri);
        let saveUrl = MossUtils.getEndpoint(databusResource);

        let body = layerTemplate
            .replace(layerNamePlacehodler, layerName)
            .replace(databusResourcePlacehodler, databusResource);

        // AB DIE POST
        // await fetch mit POST body auf saveURL
    }

</script>

<h1>Create Layer</h1>

<p>Layer Name</p>
<input bind:value={layerName} placeholder="Layer name..." />
  
<p>Databus Resource</p>
<input bind:value={databusResource} placeholder="Databus resource..." />

<br/>

<SaveButton bind:name={buttonName} on:click={onCreateButtonClicked}>
</SaveButton>



<style>
.side {
    float: right;
    padding: 1em;
    width: 35%;
}

.left-side {
    display: flex;
    padding: 1em;
    gap: 40px;
    /* width: 35%; */
}

.top, .bottom {
    flex: 1;
    display: flex;
    align-items: center;
}

.top {
    justify-content: space-between;
}

.bottom {
    margin-top: 20px;
    padding: 1em;
}
</style>