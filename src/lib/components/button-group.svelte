<script lang="ts">
  import { ButtonGroup, Button } from 'flowbite-svelte';
  import { UserCircleSolid, DownloadSolid } from 'flowbite-svelte-icons';
</script>

<ButtonGroup class="*:!ring-primary-700">
    <Button>
        <UserCircleSolid class="w-4 h-4 me-2" />
        Profile
    </Button>
    <Button>
        <DownloadSolid class="w-4 h-4 me-2" />
        Settings
    </Button>
</ButtonGroup>