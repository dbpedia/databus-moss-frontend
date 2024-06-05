<script lang="ts">
    import { 
            BreadcrumbItem, 
			} 
            from 'flowbite-svelte';
    import { A } from 'flowbite-svelte';

    export let link: string;
    export let label: string | undefined;
    
</script>

<A href={link}>
    <BreadcrumbItem>
        {label}
    </BreadcrumbItem>
</A>