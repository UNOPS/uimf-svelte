<script lang="ts">
	import Image from '$lib/Outputs/Image.svelte';

	import {onMount} from 'svelte';

	let image : Image;
	let target: HTMLElement;

	onMount(() => {
		image = new Image({
			target,
			props: {
				value: 'http://localhost:59742/api/Document/catalogue-image/8'
			}
		});
		image.data.setValue('http://localhost:59742/api/Document/catalogue-image/8');
	});
	
</script>

<h1>Outputs / Image</h1>
<div bind:this={target} />