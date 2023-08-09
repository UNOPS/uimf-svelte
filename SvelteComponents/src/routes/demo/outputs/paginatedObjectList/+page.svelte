<script lang="ts">
	import PaginatedObjectList from '$lib/Outputs/PaginatedObjectList.svelte';
	
	import {onMount} from 'svelte';

	let paginatedObjectList : PaginatedObjectList;
	let target: HTMLElement;

	onMount(() => {
		paginatedObjectList = new PaginatedObjectList({
			target,
			props: {
				value: data
			}
		});
		paginatedObjectList.data.setValue(data);
	});
	
</script>

<h1>Outputs / List of objects</h1>
<div bind:this={target} />