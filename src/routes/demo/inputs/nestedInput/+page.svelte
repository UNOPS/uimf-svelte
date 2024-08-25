<script lang="ts">
	import NestedInput from '$lib/Inputs/ComplexInput.svelte';
	import { onMount } from 'svelte';

	let nestedInput: NestedInput;
	let target: HTMLElement;

	onMount(() => {
		nestedInput = new NestedInput({
			props: {
				metadata: {
					Id: 'Nested Input',
					Required: false,
					Hidden: false,
					CustomProperties: null,
					Type: 'complex-input',
					Properties: [
						{
							Id: 'Text-a',
							Required: false,
							Hidden: false,
							CustomProperties: null,
							Type: 'text'
						},
						{
							Id: 'Text-b',
							Required: false,
							Hidden: false,
							CustomProperties: null,
							Type: 'text'
						}
					]
				},
				parentDefer: null
			},
			target
		});
	});
</script>

<h1>Inputs / Nested Input</h1>
<div bind:this={target} />
<button
	on:click={() => {
		console.log(nestedInput.getValue());
	}}>Get Value</button
>
