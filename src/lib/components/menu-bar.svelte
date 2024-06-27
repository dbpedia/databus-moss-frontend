<script lang="ts">
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
    </NavBrand>
    <NavHamburger  />
    <NavUl >
        <NavLi href="/">Home</NavLi>
        <NavLi href="/browse">Browse</NavLi>
        <NavLi href="/create-layer">Create Layer</NavLi>
        <NavLi href="/create-user">Create User</NavLi>
        <NavLi>
            <Login/>
        </NavLi>
    </NavUl>
</Navbar>


<style>

</style>