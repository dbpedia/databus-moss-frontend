<script lang="ts" context="module">
    import CodeMirror from "svelte-codemirror-editor";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import {linter, lintGutter, type Diagnostic } from "@codemirror/lint";




    let extensions = [
        linter(jsonParseLinter())
    ]

    let searchInput : string;
    async function onSearchInputChanged() {
        var response = await fetch("http://localhost:2003/api/search?type=class&query=sub%20meth");
    }

</script>

<h1>Dopumimp</h1>

<input bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search files..." />
