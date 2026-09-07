<script lang="ts">
	import { onDestroy } from 'svelte';

	export let text: string;
	export let value: string | undefined = undefined;

	let copied = false;
	let timeout: ReturnType<typeof setTimeout> | null = null;

	$: copyValue = value ?? text;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(copyValue);
			copied = true;
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => (copied = false), 1200);
		} catch (e) {
			console.error('Clipboard copy failed:', e);
		}
	}

	onDestroy(() => {
		if (timeout) clearTimeout(timeout);
	});
</script>

<span class="copy-span">
	<code>{text}</code>
	<button
		type="button"
		class="copy-btn {copied ? 'copied' : ''}"
		on:click={copyToClipboard}
		title="Copy to clipboard"
		aria-label="Copy {text} to clipboard"
	>
		<svg
			viewBox="0 0 64 64"
			xmlns="http://www.w3.org/2000/svg"
			stroke-width="3"
			stroke="currentColor"
			fill="none"
			class="icon clipboard-idle"
			aria-hidden="true"
		>
			<rect x="11.13" y="17.72" width="33.92" height="36.85" rx="2.5" />
			<path
				d="M19.35,14.23V13.09a3.51,3.51,0,0,1,3.33-3.66H49.54a3.51,3.51,0,0,1,3.33,3.66V42.62a3.51,3.51,0,0,1-3.33,3.66H48.39"
			/>
		</svg>
		<svg
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="icon clipboard-done"
			aria-hidden="true"
		>
			<path
				d="M11 1.5H13.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H2.5C1.94772 14.5 1.5 14.0523 1.5 13.5V1.5H4M5 8.5L7 10.5L10.5 6.5M4.5 0.5H10.5V2.5C10.5 3.05228 10.0523 3.5 9.5 3.5H5.5C4.94772 3.5 4.5 3.05228 4.5 2.5V0.5Z"
				stroke="currentColor"
				stroke-width="1"
			/>
		</svg>
	</button>
</span>

<style>
	.copy-span {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		vertical-align: middle;
		font-family: monospace;
		background-color: rgba(59, 130, 246, 0.1);
		padding: 0.05rem 0.2rem 0.05rem 0.35rem;
		border-radius: 0.25rem;
		color: #1e40af;
	}

	code {
		background: none;
		padding: 0;
		border-radius: 0;
		font-family: inherit;
	}

	.copy-btn {
		position: relative;
		background: transparent;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border-radius: 0.2rem;
		color: inherit;
		outline: none;
	}

	.copy-btn:hover,
	.copy-btn:focus,
	.copy-btn:active,
	.copy-btn.copied {
		background: transparent;
		color: inherit;
		outline: none;
		box-shadow: none;
	}

	.icon {
		position: absolute;
		width: 0.875rem;
		height: 0.875rem;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.clipboard-idle {
		opacity: 1;
		transform: scale(1);
	}

	.clipboard-done {
		opacity: 0;
		transform: scale(0.6);
	}

	.copy-btn.copied .clipboard-idle {
		opacity: 0;
		transform: scale(0.6);
	}

	.copy-btn.copied .clipboard-done {
		opacity: 1;
		transform: scale(1);
	}
</style>
