<script lang="ts">
	import HalResourcePage from '$lib/components/hal-resource-page.svelte';

	export let data: any;
</script>

<HalResourcePage {data} entityType="terminologies" unavailableMessage="This terminology resource is temporarily unavailable." />
