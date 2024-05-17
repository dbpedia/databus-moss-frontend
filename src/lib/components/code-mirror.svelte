<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import {linter } from "@codemirror/lint";

    let extensions = [
        linter(jsonParseLinter())
    ]
    
    export let value: string;
</script>

<CodeMirror bind:value lang={json()} extensions={extensions} />
