<script lang="ts">
	export let data: { terminologies: any[] };
</script>

<div class="section">
	<div class="container">
		{#if data.terminologies.length === 0}
			<p>No terminologies found.</p>
		{:else}
			<ul>
				{#each data.terminologies as t}
					<li><a href="{t._links.self.href}"><strong>{t.label}</strong> ({t.id})</a></li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
