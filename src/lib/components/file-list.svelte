<script lang="ts">
	import { page } from '$app/stores';
    import { FolderOpenOutline, FileOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
    import { MossUtils } from '$lib/utils/moss-utils';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import { get } from 'svelte/store';
    import { 
            Listgroup,
            ListgroupItem,
            A,
            type ListGroupItemType,
           } 
        from 'flowbite-svelte';

    export let collection: string[] | undefined;
    export let files = true;
    let iconType = files? FileOutline : FolderOpenOutline;

</script>

<ul>
    <div class="item-list">
        <div class="grid gap-2 mb-6 md:grid-cols-1">
            <div class="item-list-item">
                <Listgroup active items={collection} let:item>
                    <svelte:component this={iconType} class="w-4 h-4 me-2.5"/>
                    {item.name}
                </Listgroup>
            </div>
        </div>
    </div>
</ul>

<style>

.item-list {
    flex-direction: row;
    gap: 1em;
}

</style>