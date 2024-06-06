<script lang="ts">
    import {
        NavBrand,
        NavLi,
        Navbar,
        NavUl,
		NavHamburger,
    } 
    from 'flowbite-svelte';

</script>

<Navbar rounded color="form" >
    <NavBrand href="/">
        <img src="/icon.svg" class="me-3 h-6 sm:h-9" alt="Moss Logo" />
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">MOSS</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl >
        <NavLi href="/">Home</NavLi>
        <NavLi href="/g">Browse</NavLi>
        <NavLi href="/create-layer">Create Layer</NavLi>
    </NavUl>
</Navbar>


<style>

</style>