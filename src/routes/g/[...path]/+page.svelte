<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import CodeMirror from "$lib/components/code-mirror.svelte";
    let data : any;
    let isDocument = false;
    let isLoading = true;
    let absolutePath : string;
    let jsonString : string;

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
                jsonString = JSON.stringify(data, null, 3);
            }

            isLoading = false;
            

        } catch(err) {
            console.log(err);
            isLoading = false;
        }
    });

    async function saveDocument() {
        alert(jsonString);
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
<CodeMirror bind:value={jsonString} />
<button on:click={saveDocument}>Save</button>
{/if}
{/if}