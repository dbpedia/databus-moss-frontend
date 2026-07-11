<script lang="ts">
    import { page } from '$app/stores';
    import {
        NavBrand,
        NavLi,
        Navbar,
        NavUl,
		NavHamburger,
    }
    from 'flowbite-svelte';
    import Login from './login.svelte';
    import { getDefaultAdminPath, hasAdminAccess, hasPermission, PERMISSIONS } from '$lib/utils/auth-utils';

    $: canWriteModules = hasPermission($page.data.userData, PERMISSIONS.WRITE_MODULES);
    $: canWriteTerminologies = hasPermission($page.data.userData, PERMISSIONS.WRITE_TERMINOLOGIES);
    $: canWriteFacets = hasPermission($page.data.userData, PERMISSIONS.WRITE_FACETS);
    $: canReadUsers = hasPermission($page.data.userData, PERMISSIONS.READ_USERS);
    $: canWriteRoles = hasPermission($page.data.userData, PERMISSIONS.WRITE_ROLES);
    $: settingsHref = getDefaultAdminPath($page.data.userData) ?? '/admin';
</script>

<Navbar rounded color="form" >
    <NavBrand href="/">
        <img src="/moss.svg" class="me-3 h-6 sm:h-9" alt="Moss Logo" />
        <!-- <img src="/icon.svg" class="me-3 h-6 sm:h-9" alt="Moss Logo" /> -->
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">MOSS</span>
        <span style="color: #aaa; margin-left: 0.5em">{import.meta.env.VITE_APP_VERSION}</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl>
        <NavLi href="/">Home</NavLi>
        <NavLi href="/entries">Entries</NavLi>
        <NavLi href="/modules">Modules</NavLi>
        <NavLi href="/terminologies">Terminologies</NavLi>

        {#if hasAdminAccess($page.data.userData)}
        <NavLi href={settingsHref}>Settings</NavLi>
        {/if}
    </NavUl>

    <Login/>
</Navbar>


<style>

</style>