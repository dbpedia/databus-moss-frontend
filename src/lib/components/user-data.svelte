<script lang="ts">
    import {
            BreadcrumbItem,
			}
            from 'flowbite-svelte';
    import {
        A,
        Avatar,
     } from 'flowbite-svelte';

    export let userName = "Username";
    export let info = "Some additional information."
    const defaultImg = "/profile-picture-5.jpg";

</script>

<div class="flex items-center space-x-4 rtl:space-x-reverse">
    <Avatar src={defaultImg} rounded />
        <div class="space-y-1 font-medium dark:text-white">
            <div>{userName}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">{info}</div>
    </div>
</div>


<style>

</style>