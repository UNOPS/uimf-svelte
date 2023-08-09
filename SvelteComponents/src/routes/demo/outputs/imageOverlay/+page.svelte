<script lang="ts">
	import ImageOverlay from '$lib/Outputs/ImageOverlay.svelte';

	import {onMount} from 'svelte';

	let imageOverlay : ImageOverlay;
	let target: HTMLElement;

	onMount(() => {
		imageOverlay = new ImageOverlay({
			target,
			props: {
				value: data
			}
		});
		imageOverlay.data.setValue(data);
	});
	
</script>

<h1>Outputs / Image</h1>
<div bind:this={target} />