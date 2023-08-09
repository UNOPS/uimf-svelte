<script lang="ts">
	import Dropdown from '$lib/Inputs/Dropdown.svelte';

	import { onMount } from 'svelte';

	let dropdown: Dropdown;
	let target: HTMLElement;

	onMount(() => {
		dropdown = new Dropdown({
			target,
			props: {
				metadata: {}
			}
		});
	});
</script>

<h1>Inputs / Dropdown</h1>
<div bind:this={target} />
<button
	on:click={() => {
		dropdown?.getValue().then((res) => alert(`Dropdown has value: ${res}`));
	}}>Get Value</button
>
