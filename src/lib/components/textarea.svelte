<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface $$Props extends Omit<HTMLTextareaAttributes, 'class'> {
		value?: string;
		class?: string;
	}

	export let value = '';

	let className = '';
	export { className as class };
</script>

<textarea
	class="moss-input {className}"
	bind:value
	on:input
	on:change
	on:focus
	on:blur
	{...$$restProps}
></textarea>

<style>
	.moss-input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: #111827;
		font-family: inherit;
		background-color: #fff;
	}

	.moss-input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}
</style>
