<script lang="ts">
	import ResourceUri from './resource-uri.svelte';
	import { env } from '$env/dynamic/public';
	import type { MossModule } from '$lib/types';

	export let moduleInfo: MossModule
</script>

<div>
	<h1>{moduleInfo.label}</h1>
	<ResourceUri uri={`${env.PUBLIC_MOSS_BASE_URL}/modules/${moduleInfo.id}`} isRelative={true} />
	<div class="desc">{moduleInfo.description}</div>
	<div class="meta">Language: {moduleInfo.language}</div>
</div>

<style>

h1 {
	padding: 0;
	margin: 0;
	font-weight: 600;
	margin-bottom: -0.15rem;
    color: #3b3f44;
}

.desc {
	margin-top: 0.3rem;
	margin-bottom: 0.3rem;
	font-size: 0.95rem;
    color: #4b5563;
}

.meta {
	font-size: 0.85rem;
	color: #878b94;
}

</style>
