<script lang="ts">
	import { page } from '$app/stores';
    import { Listgroup,
            ListgroupItem,
            A } 
            from 'flowbite-svelte';
    import { FolderOpenOutline, FileOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
    import { MossUtils } from '$lib/utils/moss-utils';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import { get } from 'svelte/store';


    let linkURI: string;
    export let collection: string[] | undefined;
    export let files = true;
    let items: {name: string, icon: any}[] | undefined;
    let isLoading = true;

    onMount(async () => {
        const iconType = files? FileOutline : FolderOpenOutline;
        const currentURI = $page.params.path;
        console.log("coll", collection);
        console.log("curr", currentURI);

        try {
            items = collection?.map((item) => {
                if (item.startsWith("/")) {
                    item = item.substring(1);
                }
                return {
                    name: item,
                    icon: iconType
                };
            });

            if(!items) {
                console.log("nooo")
                items = [{name: "", icon: ""}];
            }

            console.log("current", currentURI);
            linkURI = currentURI;
        } catch (error) {
            
        } finally {
            isLoading = false;
        }
    });

    function buildLink(linkURI: string, item: string): string {
        let url = "/g/" + linkURI + "/" + item;
        return url.replace(/\/{2,}/g, '/');
    }

</script>

<ul>
    {#if isLoading}
        <p>Loading...</p>
    {/if}
    {#if !isLoading}
        {#if collection?.length}
            <Listgroup active items={collection} let:item>
                <A href={buildLink(linkURI, item)} target="_self">
                        {item}
                </A>
            </Listgroup>
        {/if}
    {/if}
</ul>

<style>

.icon {
    color: blue;
}

.file-list-group-item a {
    display: block;
    padding: 8px 16px; /* Adjust as needed */
    text-decoration: none;
    color: inherit; /* Ensures text color is inherited */
}

.list-item {
    display: flex;
}

.fit-text {
    background-color: blueviolet;
    overflow-wrap: break-word; /* Break long words to fit within the container */
    word-wrap: break-word;     /* Compatibility for older browsers */
    white-space: normal;       /* Allow text to wrap normally */
    padding: 8px 16px;         /* Adjust padding to fit text properly within borders */
    box-sizing: border-box;    /* Include padding and border in the element's total width and height */
    max-width: 100%;           /* Ensure the element does not exceed the container's width */
}

</style>