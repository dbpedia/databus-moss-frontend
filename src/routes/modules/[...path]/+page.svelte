<script lang="ts">
	import HalResourcePage from '$lib/components/hal-resource-page.svelte';

	export let data: any;
</script>

<HalResourcePage {data} unavailableMessage="This module resource is temporarily unavailable." />
