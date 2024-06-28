<script lang="ts">
    import { SignIn, SignOut } from "@auth/sveltekit/components"
    import { page } from "$app/stores"
    import { signIn } from '@auth/sveltekit/client'
	import { Avatar, GradientButton } from "flowbite-svelte";
    import {
        ArrowRightOutline,
        ArrowLeftToBracketOutline
    } from "flowbite-svelte-icons";

    const imagePlaceholder = "/profile-picture-5.jpg";
</script>


<div style="display: flex; align-items: center">
{#if $page.data.session}
    <div style="margin-right: 1em">Logged in as <a style="color: cadetblue;" href="/user">{$page.data.session.user?.name ?? "User"}</a></div>

    <SignOut>
        <GradientButton slot="submitButton" outline color="tealToLime">
            <span class="spanBase">
                <span>{$page.data.session.user?.name ?? "User"}</span>
                 {#if !$page.data.session.user?.image}
                    <Avatar src={imagePlaceholder} size="xs"/>
                 {/if}
                <ArrowLeftToBracketOutline/>
            </span>
        </GradientButton>
    </SignOut>
{:else}
    <SignIn provider="oidc_provider">
        <GradientButton slot="submitButton" outline color="tealToLime">
            <span>Sign In</span>
            <ArrowRightOutline/>
        </GradientButton>
    </SignIn>
{/if}
</div>


<style>

    .spanBase {
        display: flex;
        justify-content: space-between;
    }

</style>