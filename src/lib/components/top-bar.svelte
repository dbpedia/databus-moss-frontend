<script lang="ts">
    import {
            Breadcrumb,
            BreadcrumbItem, 
            A,
            } 
            from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { HomeOutline, ChevronDoubleRightOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
    import TopBarLink from './top-bar-link.svelte';
	import { page } from '$app/stores';

    const path = $page.params.path;
    let refs: string[] = [];

    onMount(async () => {
        console.log("path", path);
        let segments = getSegments(path);
        console.log("path", path);
        console.log("segments", segments);
    });

    function getSegments(path: string) {
        let links: string[] = [];
        if (!path) {
            return links;
        }
        let segments = path.split("/");
        let previous = "";

        segments.forEach((segment) => {
            if (segment === '') {
                return;
            }
            previous += "/" + segment;
            links.push(previous);
        });
        return links;
    }

    function createSegment(index: number): string {
        console.log("segments", refs);
        if (!refs || refs.length === 0) {
            return "";
        }
        let url = refs[index];
        return url;
    }

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
        {#each getSegments(path) as segment, index }
            <TopBarLink link={"/g" + segment} label={MossUtils.getLastPathSegment(segment)}></TopBarLink>
        {/each}
    </Breadcrumb>
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        margin: 1em;
    }

    .container > Breadcrumb {
        display: flex;
        align-items: stretch;
    }

    .container > Breadcrumb > div {
        flex: 1;
    }
</style>