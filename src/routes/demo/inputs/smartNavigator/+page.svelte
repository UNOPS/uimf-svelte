<script lang="ts">
	import SmartNavigator from '$lib/Components/SmartNavigator.svelte';
	import type { FormMetadata } from '$lib/Infrastructure/uimf';
	import { onMount } from 'svelte';
	import formMetaData from './metadata.json';

	let target: HTMLElement;

	onMount(() => {
		new SmartNavigator({
			target,
			props: {
				formMetadatas: formMetaData.formMetadata as unknown as FormMetadata[]
			}
		});
	});
</script>

<h1>Inputs / Smart Navigator</h1>
<div bind:this={target} />
