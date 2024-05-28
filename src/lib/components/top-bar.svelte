<script lang="ts">
    import {
            Breadcrumb,
            BreadcrumbItem, 
            A,
            } 
            from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { HomeOutline } from 'flowbite-svelte-icons';
    import TopBarLink from './top-bar-link.svelte';

    export let segments: string[]; 

</script>

<div class="container">
    <Breadcrumb  aria-label="Default breadcrumb example">
        <A href={"/g"} target="_self">
            <BreadcrumbItem home={true} slots={{icon: HomeOutline}}>
                <svelte:fragment slot="icon">
                    <HomeOutline class="w-4 h-4 me-2"/>
                </svelte:fragment>
            </BreadcrumbItem>
        </A>
        {#each segments as segment}
            <TopBarLink link={segment} label={MossUtils.getLastPathSegment(segment)}></TopBarLink>
        {/each}
    </Breadcrumb>
</div>

<style>
    .container {
        position: fixed;
        top: 0;
        left: 50%;
        transform: translate(-50%);
        width: 80%;
        padding: 10px;
        z-index: 1000;
        margin: 1em;
    }

</style>