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

    $: caller = $page.data.caller;
    $: canWriteModules = hasPermission(caller, PERMISSIONS.WRITE_MODULES);
    $: canWriteTerminologies = hasPermission(caller, PERMISSIONS.WRITE_TERMINOLOGIES);
    $: canWriteFacets = hasPermission(caller, PERMISSIONS.WRITE_FACETS);
    $: canReadUsers = hasPermission(caller, PERMISSIONS.READ_USERS);
    $: canWriteRoles = hasPermission(caller, PERMISSIONS.WRITE_ROLES);
    $: canReadMetadata = hasPermission(caller, PERMISSIONS.READ_METADATA);
    $: settingsHref = getDefaultAdminPath(caller) ?? '/admin';
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

        {#if canReadMetadata}
        <NavLi href="/sparql" target="_blank" rel="noopener noreferrer">SPARQL</NavLi>
        {/if}

        {#if hasAdminAccess(caller)}
        <NavLi href={settingsHref}>Settings</NavLi>
        {/if}
    </NavUl>

    <Login/>
</Navbar>


<style>

</style>