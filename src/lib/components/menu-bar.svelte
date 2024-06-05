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
    .container {
        top: 0;
        z-index: 1000;
        margin-left: 1em;
        margin-right: 1em;
    }

    .header {
        background-color: azure;
        padding-left: 1em;
        padding: 1em;
    }

    .a-tag {
        background-color: aqua;
        text-align: center;
    }

</style>