<script lang="ts" context="module">
    import CodeMirror from "svelte-codemirror-editor";
    import { EditorView } from "@codemirror/view";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import { javascript } from "@codemirror/lang-javascript";
    import {syntaxTree} from "@codemirror/language";
    import {linter, lintGutter, type Diagnostic } from "@codemirror/lint";
    import { onMount } from 'svelte';

    let value: string = `{
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

</script>

<h1>Docuemtn</h1>
<CodeMirror bind:value lang={json()} extensions={extensions} />
