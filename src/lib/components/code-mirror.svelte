<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import { yaml } from "@codemirror/lang-yaml";
    import { linter } from "@codemirror/lint";

    export let value: string;
    export let format: 'json' | 'turtle' | 'yaml' | 'none' = 'json'; // Default to JSON

    // Function to determine language and extensions based on format
    function getLanguageAndExtensions() {
        switch (format) {
            case 'json':
                return {
                    lang: json(),
                    extensions: [linter(jsonParseLinter())]
                };
            case 'turtle':
                return {
                    lang: null,
                    extensions: [] // Add Turtle linter here if needed
                };
            case 'yaml':
                return {
                    lang: yaml(),
                    extensions: [] // Add YAML linter here if needed
                };
            case 'none':
                return {
                    lang: null, // No specific language
                    extensions: [] // No linter
                };
            default:
                return {
                    lang: json(),
                    extensions: [linter(jsonParseLinter())]
                };
        }
    }

    // Get the current language and extensions
    let { lang, extensions } = getLanguageAndExtensions();

    function onCodeChanged(e: CustomEvent<string>) {
        value = e.detail;
    }
</script>

<div class="container">
    <CodeMirror 
        bind:value 
        lang={lang}  
        extensions={extensions}
    />
</div>

<style>
.container {
    width: 100%;
}
</style>
