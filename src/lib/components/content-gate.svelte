<script lang="ts">
	import { page } from '$app/stores';
	import Login from './login.svelte';
	import { isAccessDenied } from '$lib/utils/auth-utils';

	export let status: number | undefined = undefined;
	export let unavailableMessage = 'This content is temporarily unavailable.';
</script>

{#if status}
	<div class="content-gate">
		<div class="content-gate-inner">
			{#if !$page.data.userData}
				<p class="sign-in-message">Sign in to browse content</p>
				<div class="sign-in-action">
					<Login />
				</div>
			{:else if isAccessDenied(status)}
				<p class="denied-message">You are not allowed to view this content.</p>
			{:else}
				<p class="denied-message">{unavailableMessage}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.content-gate {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
		width: 100%;
	}

	.content-gate-inner {
		text-align: center;
	}

	.sign-in-message {
		font-size: 1.25rem;
		color: #444;
		margin: 0 0 1.5rem;
	}

	.sign-in-action {
		display: flex;
		justify-content: center;
	}

	.denied-message {
		font-size: 1.25rem;
		color: #888;
		margin: 0;
	}
</style>
