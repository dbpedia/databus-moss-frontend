<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { json, jsonParseLinter } from "@codemirror/lang-json";
	import { yaml } from "@codemirror/lang-yaml";
	import { linter } from "@codemirror/lint";
	import type { LanguageSupport } from "@codemirror/language";
	import type { Extension } from "@codemirror/state";

	export let value: string;
	export let format: string | null;
	export let readonly: boolean = false;
	export let minLines: number = 10;

	let lang: LanguageSupport | null;
	let extensions: Extension[] | undefined = [];

	$: {
		const config = getLanguageAndExtensions(format);
		lang = config.lang;
		extensions = config.extensions;
	}

	// Ensure minimum line count by padding with newlines
	$: {
		if (value) {
			const lines = value.split("\n");
			if (lines.length < minLines) {
				value = lines.concat(Array(minLines - lines.length).fill("")).join("\n");
			}
		} else {
			value = Array(minLines).fill("").join("\n");
		}
	}

	function getLanguageAndExtensions(format: string | null) {
		switch (format) {
			case "application/json":
			case "application/ld+json":
				return { lang: json(), extensions: [linter(jsonParseLinter())] };
			case "text/turtle":
				return { lang: null, extensions: [] };
			case "yaml":
				return { lang: yaml(), extensions: [] };
			case "none":
				return { lang: null, extensions: [] };
			default:
				return { lang: json(), extensions: [linter(jsonParseLinter())] };
		}
	}

	function onCodeChanged(e: CustomEvent<string>) {
		value = e.detail;
	}
</script>

<div class="container">
	<CodeMirror
		bind:value
		editable={!readonly}
		readonly={readonly}
		lang={lang}
		extensions={extensions}
	/>
</div>

<style>
.container {
	width: 100%;
}
</style>
