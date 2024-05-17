<script lang="ts">
    export let data : any;

    let used = data.used;
    let explanations = data.explanations;
</script>

<h1>{used}</h1>

<ul>
	{#each explanations as explanation }
		<h2>{explanation.label}</h2>
        <div>CLASS: <a href="{explanation.id}">{explanation.idName}</a></div>
        <div>MOD: <a href="{ data.path }">{ data.modName }</a></div>
	{/each}
</ul>
