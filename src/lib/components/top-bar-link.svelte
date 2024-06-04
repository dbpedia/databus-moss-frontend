<script lang="ts">
    import { 
            BreadcrumbItem, 
			} 
            from 'flowbite-svelte';
    import { A } from 'flowbite-svelte';

    export let link: string;
    export let label: string | undefined;
    
</script>

<A href={link} target="_self">
    <BreadcrumbItem>
        {label}
    </BreadcrumbItem>
</A>