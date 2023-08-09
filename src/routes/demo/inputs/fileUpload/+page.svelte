<script lang="ts">
	import FileUpload from '$lib/Inputs/FileUpload.svelte';
	import { onMount } from 'svelte';

	let fileUpload : FileUpload;
    let target: HTMLElement;

	onMount(() => {
		fileUpload = new FileUpload({
            target,
            props: {
                metadata: {
                    Required: false,
                    Hidden: false,
                    Id: "file-upload",
                    Label: "file-upload",
                    CustomProperties: {
                        FileUploadType: 1,
                        FileUploadTypes: null
                    }
                },
            },
        });
	});
</script>

<h1>Inputs / Smart Navigator</h1>
<div bind:this={target} />
<button on:click={() => {console.log(fileUpload.getValue());}}>Get Value</button>