<script lang="ts">
    import { SignIn, SignOut } from "@auth/sveltekit/components"
    import { page } from "$app/stores"
    
    const imagePlaceholder = "/static/profile-picture-5.jpg";
</script>


<div style="display: flex; align-items: center">
{#if $page.data.session}
    <div style="margin-right: 1em">Logged in as <a style="color: cadetblue;" href="/user">{$page.data.session.user?.name ?? "User"}</a></div>
        
    <SignOut>
    <button slot="submitButton" class="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
        <span class="spanBase">
            <!-- {#if $page.data.session.user?.image} -->
            {#if true}
                <img
                    class="w-8 h-8 p-0.5 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
                    src={imagePlaceholder}
                    alt="Bordered avatar"
                />
            {/if}
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
            </svg>
        </span>
    </button>

    </SignOut>
{:else}
    <SignIn provider="oidc_provider">
    <button slot="submitButton" class="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
        <span class="spanBase">
            Sign in
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
            </svg>
        </span>
    </button>
    </SignIn>
{/if}
</div>


<style>

    .spanBase {
        @apply flex items-center space-x-2 relative px-5 py-2.5;
    }

</style>