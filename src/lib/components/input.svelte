<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface $$Props extends Omit<HTMLInputAttributes, 'class' | 'readonly' | 'disabled'> {
		value?: string | number;
		class?: string;
		readonly?: boolean;
		disabled?: boolean;
	}

	export let value: string | number = '';
	export let readonly = false;
	export let disabled = false;

	let className = '';
	export { className as class };
</script>

<input
	class="moss-input {className}"
	bind:value
	readonly={readonly || undefined}
	disabled={disabled || undefined}
	on:input
	on:change
	on:focus
	on:blur
	on:keydown
	on:keyup
	{...$$restProps}
/>

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

	.moss-input:read-only,
	.moss-input:disabled {
		background-color: #f3f4f6;
		cursor: not-allowed;
	}
</style>
