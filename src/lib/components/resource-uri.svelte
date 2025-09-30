<script lang="ts">
	export let uri: string | null | undefined;
	export let fontSize: string = "0.85rem";

	let copied = false;
	let timeout: ReturnType<typeof setTimeout> | null = null;

	async function copyToClipboard() {

		if(uri == null) {
			return;
		}

		try {
			await navigator.clipboard.writeText(uri);
			copied = true;
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => (copied = false), 1200);
		} catch (e) {
			console.error("Clipboard copy failed:", e);
		}
	}
</script>

<div class="uri-wrapper" style={`font-size: ${fontSize}`}>
	<a class="uri-link" href={uri} target="_blank" rel="noopener noreferrer">{uri}</a>
	<button
		type="button"
		class="copy-btn {copied ? 'copied' : ''}"
		on:click={copyToClipboard}
		title="Copy to clipboard"
	>
		<!-- Idle copy icon -->
		<svg
			viewBox="0 0 64 64"
			style="width: 20px;"
			xmlns="http://www.w3.org/2000/svg"
			stroke-width="3"
			stroke="#A1A1A1"
			fill="none"
			class="icon clipboard-idle"
		>
			<rect x="11.13" y="17.72" width="33.92" height="36.85" rx="2.5" />
			<path d="M19.35,14.23V13.09a3.51,3.51,0,0,1,3.33-3.66H49.54a3.51,3.51,0,0,1,3.33,3.66V42.62a3.51,3.51,0,0,1-3.33,3.66H48.39" />
		</svg>

		<!-- Clipboard with checkmark -->
		<svg
			viewBox="0 0 15 15"
			style="width: 16px;"
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
</div>

<style>
	.uri-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
	}

	.uri-link {
		color: #2563eb;
		text-decoration: none;
		white-space: nowrap;
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 0.2s ease;
	}
	.uri-link:hover {
		color: #1d4ed8;
		text-decoration: underline;
	}

	.copy-btn {
		position: relative;
		background: #f3f4f6;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		transition: background 0.25s ease;
		overflow: hidden;
	}
	.copy-btn:hover {
		background: #e5e7eb;
	}
	.copy-btn:active {
		background: #bbf7d0;
	}
	.copy-btn.copied {
		background: #bbf7d0;
	}

	.icon {
		position: absolute;
		width: 1.2rem;
		height: 1.2rem;
		transition: opacity 0.25s ease, transform 0.25s ease;
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
