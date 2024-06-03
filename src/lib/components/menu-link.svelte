<script lang="ts">
	import { 
        FileCirclePlusOutline,
        FolderDuplicateOutline,
    } from "flowbite-svelte-icons";
    import { A } from "flowbite-svelte";

    const linkColor: string = "secondary";
    export let href: string;
    export let icon;


</script>

<A href={href} color={linkColor}>
    <svelte:component this={icon}/>
    <slot/>
</A> 