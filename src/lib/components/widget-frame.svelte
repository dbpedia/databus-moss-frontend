<script lang="ts">
    import { env } from '$env/dynamic/public'
    export let moduleId: string;

    
    let iframeSrc: string = `${env.PUBLIC_MOSS_BASE_URL}/api/modules/${moduleId}/widget.html`;

    function handleMessage(event: MessageEvent) {
        if (event.data && typeof event.data === 'object' && 'searchUrl' in event.data) {
            const { searchUrl } = event.data as { searchUrl: string };
            if (typeof searchUrl === 'string') {
                window.location.href = searchUrl;
            }
        }
    }

    import { onMount, onDestroy } from 'svelte';

    onMount(() => {
        window.addEventListener('message', handleMessage);
    });

    onDestroy(() => {
        window.removeEventListener('message', handleMessage);
    });
</script>

<iframe
  src={iframeSrc}
  sandbox="allow-scripts allow-forms"
  style="width:100%; height:300px; border:none;"
  title={`Widget: ${moduleId}`}
/>
