<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'create' | 'table' | 'danger';

	interface $$Props extends Omit<HTMLButtonAttributes, 'class'> {
		variant?: Variant;
		class?: string;
	}

	export let variant: Variant = 'primary';

	let className = '';
	export { className as class };
</script>

<button
	class="moss-btn moss-btn-{variant} {className}"
	on:click
	on:focus
	on:blur
	on:keydown
	on:keyup
	on:mouseenter
	on:mouseleave
	{...$$restProps}
>
	<slot />
</button>

<style>
	.moss-btn {
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s;
	}

	.moss-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.moss-btn-primary {
		background-color: #4f46e5;
		color: white;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
	}

	.moss-btn-primary:hover:not(:disabled) {
		background-color: #6366f1;
	}

	.moss-btn-secondary {
		background-color: #f3f4f6;
		color: #374151;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
	}

	.moss-btn-secondary:hover:not(:disabled) {
		background-color: #e5e7eb;
	}

	.moss-btn-create {
		padding: 0.3em 0.6em;
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
	}

	.moss-btn-create:hover:not(:disabled) {
		background-color: #6366f1;
	}

	.moss-btn-table {
		padding: 0.2em 0.5em;
		margin-right: 0.3em;
		border: 1px solid #d1d5db;
		background: #f3f4f6;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	.moss-btn-table:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.moss-btn-danger {
		background-color: #dc2626;
		color: white;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
	}

	.moss-btn-danger:hover:not(:disabled) {
		background-color: #b91c1c;
	}
</style>
