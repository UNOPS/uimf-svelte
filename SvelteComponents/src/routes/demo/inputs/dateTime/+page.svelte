<script lang="ts">
	import DateTime from '$lib/Inputs/DateTime.svelte';
	import { onMount } from 'svelte';

	let dateTime : DateTime;
	let target: HTMLElement;

	onMount(() => {
		dateTime = new DateTime({
            target,
            props: {
                value: '2023-5-15',
                metadata: {
                    Required: false,
                    Hidden: false,
                   
                },
            },
        });

        dateTime.init(null);
	});
</script>

<h1>Inputs / Date Time</h1>
<div bind:this={target} />
<button on:click={() => {console.log(dateTime.getValue());}}>Get Value</button>