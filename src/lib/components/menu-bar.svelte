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
        <span style="color: #aaa; margin-left: 0.5em">Alpha 0.1.1</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl>
        <NavLi href="/">Home</NavLi>
        <NavLi href="/browse">Browse</NavLi>
        <NavLi href="/create-layer">Create Layer</NavLi>
    </NavUl>

    <Login/>
</Navbar>


<style>

</style>