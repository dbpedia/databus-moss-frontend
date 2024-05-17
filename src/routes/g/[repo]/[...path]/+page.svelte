<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import {linter } from "@codemirror/lint";
    import { page } from '$app/stores';

    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';

    let aflkjas: string = `{
        "@id" : "http://localhost:8080/g/openenergy-platform.org/dataedit/view/reference/entry_groupoemetadatajsonld#layer",
        "@type" : "http://dataid.dbpedia.org/ns/moss#DatabusMetadataLayer",
        "name" : "oemetadata",
        "version" : "1.0.0",
        "endedAtTime" : "2024-05-15T13:13:39.323Z",
        "generated" : "http://localhost:8080/g/openenergy-platform.org/dataedit/view/reference/entry_groupoemetadatajsonld",
        "startedAtTime" : "2024-05-15T13:13:39.323Z",
        "used" : "https://openenergy-platform.org/dataedit/view/reference/entry_group",
        "@context" : {
            "used" : {
            "@id" : "http://www.w3.org/ns/prov#used",
            "@type" : "@id"
            },
            "startedAtTime" : {
            "@id" : "http://www.w3.org/ns/prov#startedAtTime",
            "@type" : "http://www.w3.org/2001/XMLSchema#dateTime"
            },
            "generated" : {
            "@id" : "http://www.w3.org/ns/prov#generated",
            "@type" : "@id"
            },
            "endedAtTime" : {
            "@id" : "http://www.w3.org/ns/prov#endedAtTime",
            "@type" : "http://www.w3.org/2001/XMLSchema#dateTime"
            },
            "version" : {
            "@id" : "http://dataid.dbpedia.org/ns/moss#version"
            },
            "name" : {
            "@id" : "http://dataid.dbpedia.org/ns/moss#name"
            }
        }
    }`
    let extensions = [
        linter(jsonParseLinter())
    ]

    let condition = true;
    $: ({ repo, path, file } = $page.params);

    async function fetchData() {
        ({ repo, path, file } = $page.params);
        let response = await fetch(PUBLIC_MOSS_BASE_URL + '/' + repo + '/' path);
        let data = await respone.json();
        console.log(data);
    }
</script>

<h1>Document</h1>

<p>Current Path: {$page.url}</p>
<p>Current Repo: {repo}</p>
<p>Current Path: {path}</p>

{#if condition}
    <p>Current File: {file}</p>
    <CodeMirror bind:value lang={json()} extensions={extensions} />
{/if}
