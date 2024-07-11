<script lang="ts">
    import {
        A,
        Alert,
    } from "flowbite-svelte";
	import {
         InfoCircleSolid,
         HomeOutline
    } from "flowbite-svelte-icons";

    const msg = "Something went wrong. This route points to nowhere!";
    const errorMsg = "404";
</script>

<div class="container">
    <div class=icon>
        <A href="/browse">
            <HomeOutline class="w-14 h-14"/>
        </A>
    </div>
    <A href="/browse">
        <Alert class="full-width-alert">
            <div class="info">
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                <span class="leading-relaxed text-3xl">
                    {errorMsg}
                </span>
            </div>
            <p class="alert-message text-xl">
                Oops!
            </p>
            <br>
            <p class="alert-message">
                {msg}
            </p>
        </Alert>
    </A>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 50vh;
    }

    .full-width-alert {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .info {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
    }

    .icon {
        margin-bottom: 10px;
    }

    .alert-message {
        display: flex;
        justify-content: center;
    }
</style>