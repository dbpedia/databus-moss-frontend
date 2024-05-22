<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import CodeMirror from "$lib/components/code-mirror.svelte";
	import SaveButton from '$lib/components/save-button.svelte';
    import { EditorView } from "@codemirror/view";

    let data : any;
    let content: string;
    let isDocument = false;
    let isLoading = true;
    let absolutePath : string;

    onMount(async () => {
		
        try {
            let path = $page.params.path;

            absolutePath = `/g`;

            if(path != undefined && path.length > 0) {
                absolutePath += `/${path}`;
            }

            let response = await fetch(`${PUBLIC_MOSS_BASE_URL}/g/${path}`);
            data = await response.json();

            let contentType = response.headers.get("Content-Type");

            if(contentType != "application/json") {
                isDocument = true;
                content = JSON.stringify(data, null, 3)
            }

            isLoading = false;

        } catch(err) {
            console.log(err);
            isLoading = false;
        }
    });

    function getEndpoint(): URL {
        const iri = $page.params.path;
        const [repo] = iri.split("/", 1);
        const path = iri.substring(iri.indexOf("/") + 1);
        const endpointURL = new URL(PUBLIC_MOSS_BASE_URL);

        endpointURL.pathname = "/api/save";
        endpointURL.searchParams.append("repo", repo);
        endpointURL.searchParams.append("path", path);

        return endpointURL;
    }

    export async function postDocument(): Promise<any> {
        const url = getEndpoint();
        const data: string = JSON.stringify(content);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content,
        })
        
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`)
        }
    }

</script>

{#if !isLoading}
{#if !isDocument}
<h1>Folder</h1>
<ul>
    <li>
        <a href="{absolutePath}/.." target="_self">..</a>
    </li>
	{#each data.folders as folder }
		<li>
            <a href="{absolutePath}/{folder}" target="_self">{folder}</a>
		</li>
	{/each}
	{#each data.files as file }
		<li>
            <a href="{absolutePath}/{file}" target="_self">{file}</a>
		</li>
	{/each}
</ul>
{/if}
{#if isDocument}
<h1>Document</h1>
<a href="{absolutePath}/.." target="_self">Go Back</a>
<SaveButton on:click={postDocument} >Save Document</SaveButton>
<CodeMirror bind:value={content} />
{/if}
{/if}