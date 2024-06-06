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
    <div class="top-bar">
        <Breadcrumb  aria-label="Default breadcrumb example">
            <A href={"/"} >
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
</div>

<style>
    .container {
        top: 0;
        z-index: 1000;
        margin-left: 1em;
        margin-right: 1em;
    }

</style>