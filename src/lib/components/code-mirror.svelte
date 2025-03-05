<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { json, jsonParseLinter } from "@codemirror/lang-json";
    import { yaml } from "@codemirror/lang-yaml";
    import { linter } from "@codemirror/lint";
	import type { LanguageSupport } from "@codemirror/language";
	import type { Extension } from "@codemirror/state";

    export let value: string;
    export let format: string | null;

    let lang : LanguageSupport | null;
    let extensions : Extension[] | undefined = [];

      // Use $: to make these reactive
    $: {
        const config = getLanguageAndExtensions(format);
        lang = config.lang;
        extensions = config.extensions;
    }


    function getLanguageAndExtensions(format : string | null) {
        switch (format) {
            case 'application/json':
            case 'application/ld+json':
                return {
                    lang: json(),
                    extensions: [linter(jsonParseLinter())]
                };
            case 'text/turtle':
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
