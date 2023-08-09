<script lang="ts">
	import StateDiagram from '$lib/Outputs/StateDiagram.svelte';
	import { onMount } from 'svelte';

	const data = {
		States: [
			{ Id: 1, Name: 'Draft' },
			{ Id: 2, Name: 'Ready for tender' },
			{ Id: 3, Name: 'Tender in progress' },
			{ Id: 4, Name: 'Tender evaluation' },
			{ Id: 5, Name: 'Tender completed' },
			{ Id: 7, Name: 'Published' }
		],
		Transitions: [
			{ From: 1, To: 2, Name: 'Prepare for tender' },
			{ From: 2, To: 3, Name: 'Start tender' },
			{ From: 3, To: 4, Name: 'Start tender evaluation' },
			{ From: 4, To: 5, Name: 'Complete tender evaluation' },
			{ From: 5, To: 7, Name: 'Publish catalogue' },
			{ From: 2, To: 1, Name: 'Move back to draft' },
		],
		CurrentStateId: 1
	};

	let diagram: StateDiagram;
	let target: HTMLElement;

	onMount(() => {
		diagram = new StateDiagram({
			target,
			props: {
				value: data
			}
		});
	});
</script>

<h1>Outputs / State Diagram</h1>
<div bind:this={target} />
