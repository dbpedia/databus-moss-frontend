<script lang="ts">
	import HalResourcePage from '$lib/components/hal-resource-page.svelte';

	export let data: any;
</script>

<HalResourcePage {data} entityType="modules" unavailableMessage="Modules are temporarily unavailable." />
