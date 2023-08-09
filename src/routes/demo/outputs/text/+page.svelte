<script lang="ts">
	import Text from '$lib/Outputs/Text.svelte';

	import { onMount } from 'svelte';

	let text: Text;
	let localValue = 'Hello World';
	let target: HTMLElement;

	onMount(() => {
		text = new Text({
			target,
			props: {
				value: localValue
			}
		});
	});
</script>

<h1>Outputs / Text</h1>
<div bind:this={target} />
<input
	placeholder="Change text value here"
	type="text"
	bind:value={localValue}
	on:input={() => {
		text.data.setValue(localValue);
	}}
/>
