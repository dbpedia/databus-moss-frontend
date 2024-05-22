<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import {linter } from "@codemirror/lint";

    let extensions = [
        linter(jsonParseLinter())
    ]

    function onCodeChanged(e : CustomEvent<string>) {
        value = e.detail;
    }
    
    export let value: string;
</script>

<CodeMirror 
    bind:value lang={json()}  
    extensions={extensions}
/>
