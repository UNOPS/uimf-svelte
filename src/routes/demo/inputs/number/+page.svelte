<script lang="ts">
	import Number from '$lib/Inputs/Number.svelte';

	import { onMount } from 'svelte';

	let number: Number;
	let showNumber = true;
	let target: HTMLElement;

	onMount(() => {
		number = new Number({
			target,
			props: {
				metadata: {
					Required: true,
					Hidden: !showNumber,
					CustomProperties: {
						precision: 2
					}
				}
			}
		});
	});
</script>

<h1>Inputs / Number</h1>
<div bind:this={target} />
<button
	on:click={() => {
		showNumber = !showNumber;
		number?.show(showNumber);
	}}>Show/Hide numberbox</button
>
<button
	on:click={() => {
		number?.getValue().then((res) => alert('number box has value: ' + res));
	}}>Get Value</button
>
<button
	on:click={() => {
		number?.setValue(null);
	}}>Clear Value</button
>
