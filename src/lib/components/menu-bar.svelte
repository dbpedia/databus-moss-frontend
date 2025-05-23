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


</script>

<Navbar rounded color="form" >
    <NavBrand href="/">
        <img src="/moss.svg" class="me-3 h-6 sm:h-9" alt="Moss Logo" />
        <!-- <img src="/icon.svg" class="me-3 h-6 sm:h-9" alt="Moss Logo" /> -->
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">MOSS</span>
        <span style="color: #aaa; margin-left: 0.5em">Alpha 0.1.3</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl>
        <NavLi href="/">Home</NavLi>
        <NavLi href="/browse">Browse</NavLi>

        {#if $page.data.userData != undefined}
        <NavLi href="/create-entry">Create Entry</NavLi>
        <NavLi href="/admin">Admin Settings</NavLi>
        {/if}
    </NavUl>

    <Login/>
</Navbar>


<style>

</style>