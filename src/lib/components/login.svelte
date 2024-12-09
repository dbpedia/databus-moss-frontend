<script lang="ts">
    import { page } from "$app/stores";
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { GradientButton } from "flowbite-svelte";
    import {
        ArrowRightOutline,
        ArrowLeftToBracketOutline
    } from "flowbite-svelte-icons";

    // Function to handle sign-in manually
    async function handleSignIn() {
        try {
            await signIn('oidc_provider');
        } catch (error) {
            console.error("Sign-in failed:", error);
        }
    }

    // Function to handle sign-out manually
    async function handleSignOut() {
        try {
            await signOut();
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    }
</script>

<div style="display: flex; align-items: center">
    {#if $page.data.session}
        <div style="margin-right: 1em">
            Logged in as 
            <a class="user underline" href="/user">
                {$page.data.session.user?.name ?? "User"}
            </a>
        </div>
        <GradientButton outline color="cyanToBlue" on:click={handleSignOut}>
            <span class="spanBase">
                <span>Logout</span>
                <ArrowLeftToBracketOutline/>
            </span>
        </GradientButton>
    {:else}
        <GradientButton outline color="pinkToOrange" on:click={handleSignIn}>
            <span class="spanBase">
                <span>Sign In</span>
                <ArrowRightOutline/>
            </span>
        </GradientButton>
    {/if}
</div>

<style>
    .spanBase {
        display: flex;
        justify-content: space-between;
    }

    .user {
        color: cadetblue;
    }
</style>
