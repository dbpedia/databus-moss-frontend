<script lang="ts">
    import { FolderOpenOutline, FileOutline } from 'flowbite-svelte-icons';
    import { Listgroup } from 'flowbite-svelte';

    export let collection: any[];
    export let files = true;
    let iconType = files ? FileOutline : FolderOpenOutline;

    // Debug: Print the first artifact to inspect fields (title, artifact, name, etc.)
    console.log("Artifact sample:", collection?.[0]);
</script>

<ul>
	<div class="item-list">
		<div class="mb-6 grid gap-2 md:grid-cols-1">
			<div class="item-list-item">

                <!-- MAIN LIST -->
				<Listgroup items={collection.map((c) => c.name)} let:index>
                    <a href={collection[index]._links?.self?.href ?? '.'}>
                        <li class="flex items-center gap-2" style="min-height: 28px;">

                            <svelte:component this={iconType} class="h-4 w-4" />

                            <!-- FIX: Used title → artifact → name (in this priority) -->
                            {collection[index].title
                                ?? collection[index].artifact
                                ?? collection[index].name}

                        </li>
                    </a>
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
