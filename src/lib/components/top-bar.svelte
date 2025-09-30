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
        <Breadcrumb  class="breadcrumb" aria-label="Default breadcrumb example">
            <A href={"/"} >
            <div class="home-icon">
                <BreadcrumbItem home={true} slots={{icon: HomeOutline}}>
                    <svelte:fragment slot="icon">
                        <HomeOutline class="home-icon"/>
                    </svelte:fragment>
                </BreadcrumbItem>
            </div>
            </A>
            <div class="routes">
                {#each segments as segment}
                    <TopBarLink link={segment} label={MossUtils.getLastPathSegment(segment)}></TopBarLink>
                {/each}
            </div>
        </Breadcrumb>
    </div>
</div>

<style>
    .container {
        top: 0;
        margin-top: .5rem;
        z-index: 1000;
        margin-left: 1em;
        margin-right: 1em;
    }

    .home-icon {
        margin-right: 0.5em;
        padding-top: 8px;
    }

    .routes {
        padding-top: 10px;
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

</style>