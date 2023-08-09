<script lang="ts">
	import Radio from '$lib/Inputs/Radio.svelte';

	import { onMount } from 'svelte';

	let radio: Radio;
	let target: HTMLElement;

	onMount(() => {
		radio = new Radio({
			target,
			props: {
				metadata: {
					Required: true,
					CustomProperties: {
						Options: [
							{
								CssClass: '',
								Icon: '',
								Label: 'Text',
								Tooltip: '',
								Value: 0
							},
							{
								CssClass: '',
								Icon: '',
								Label: 'Textarea',
								Tooltip: '',
								Value: 1
							},
							{
								CssClass: '',
								Icon: '',
								Label: 'Number',
								Tooltip: '',
								Value: 2
							},
							{
								CssClass: '',
								Icon: '',
								Label: 'Dropdown',
								Tooltip: '',
								Value: 3
							},
							{
								CssClass: '',
								Icon: '',
								Label: 'Checkbox',
								Tooltip: '',
								Value: 4
							}
						]
					},
					EventHandlers: [],
					Id: 'Condition',
					Label: 'Field type',
					Type: 'radio',
					Hidden: false,
					OrderIndex: 0
				}
			}
		});
		radio.init('2');
	});
</script>

<h1>Inputs / Radio</h1>
<div bind:this={target} />
<button
	on:click={() => {
		radio?.getValue().then((res) => alert(`Radio group has value: ${res}`));
	}}>Get Value</button
>
