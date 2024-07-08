<script lang="ts">
    import { FolderOpenOutline, FileOutline } from 'flowbite-svelte-icons';
    import {
            Listgroup,
           }
        from 'flowbite-svelte';

    export let collection: any[];
    export let files = true;
    let iconType = files? FileOutline : FolderOpenOutline;

</script>

<ul>
    <div class="item-list">
        <div class="grid gap-2 mb-6 md:grid-cols-1">
            <div class="item-list-item">
                <Listgroup active items={collection} let:index>
                    <svelte:component this={iconType} class="w-4 h-4 me-2.5"/>
                    {collection[index].name}
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