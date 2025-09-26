<script>
	import Login from "./login.svelte";

	export let message = 'You need to log in to see this page.';
</script>

<section class="section">
	<div class="container">
		<h2 class="login-title">Access Restricted</h2>
		<p class="login-message">{message}</p>

		<Login />
	</div>
</section>

<style>
	.login-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #1e3a8a;
	}

	.login-message {
		font-size: 1rem;
		color: #444;
		margin-bottom: 1.5rem;
	}


</style>
