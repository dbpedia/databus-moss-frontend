<script lang="ts">
	import ContentGate from '$lib/components/content-gate.svelte';

	export let data: {
		content: string | null;
		status?: number;
	};

	let copied = false;
	let timeout: ReturnType<typeof setTimeout> | null = null;

	async function copyToClipboard() {
		if (!data.content) return;

		try {
			await navigator.clipboard.writeText(data.content);
			copied = true;
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => (copied = false), 1200);
		} catch (e) {
			console.error('Clipboard copy failed:', e);
		}
	}
</script>

<div class="section">
	<div class="container">
		{#if data.status}
			<ContentGate status={data.status} unavailableMessage="This content is temporarily unavailable." />
		{:else if data.content != null}
			<div class="content-panel">
				<div class="pre-wrapper">
					<button
						type="button"
						class="copy-btn {copied ? 'copied' : ''}"
						on:click={copyToClipboard}
						title="Copy to clipboard"
					>
						<svg
							viewBox="0 0 64 64"
							xmlns="http://www.w3.org/2000/svg"
							stroke-width="3"
							stroke="#6b7280"
							fill="none"
							class="icon clipboard-idle"
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
						>
							<path
								d="M11 1.5H13.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H2.5C1.94772 14.5 1.5 14.0523 1.5 13.5V1.5H4M5 8.5L7 10.5L10.5 6.5M4.5 0.5H10.5V2.5C10.5 3.05228 10.0523 3.5 9.5 3.5H5.5C4.94772 3.5 4.5 3.05228 4.5 2.5V0.5Z"
								stroke="#22c55e"
								stroke-width="1"
							/>
						</svg>
					</button>
					<pre>{data.content}</pre>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.content-panel {
		border: 1px solid #e5e7eb;
		background: #f9fafb;
		border-radius: 0.5rem;
		overflow: hidden;
		margin-top: 1rem;
	}

	.pre-wrapper {
		position: relative;
	}

	.copy-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 1;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.icon {
		position: absolute;
		width: 1.1rem;
		height: 1.1rem;
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
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

	pre {
		margin: 0;
		padding: 1rem;
		padding-top: 2.75rem;
		font-family: 'monospatial', monospace;
		white-space: pre-wrap;
		word-wrap: break-word;
		font-size: 0.85rem;
		overflow-x: auto;
	}
</style>
