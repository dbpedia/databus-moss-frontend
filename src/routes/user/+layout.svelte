<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="section">
	<div class="container">
		<h1>Account</h1>

		<div class="columns">
			<div class="column small sidebar">
				<a
					class="sidebar-link"
					class:active={$page.url.pathname === '/user'}
					href="/user"
				>
					Profile
				</a>
				<a
					class="sidebar-link"
					class:active={$page.url.pathname.startsWith('/user/keys')}
					href="/user/keys"
				>
					Keys
				</a>
			</div>
			<div class="column settings">
				<slot />
			</div>
		</div>
	</div>
</div>
