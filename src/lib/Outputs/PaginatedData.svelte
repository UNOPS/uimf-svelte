<script context="module" lang="ts">
	export interface PaginatedData {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import type { OutputController } from '../Infrastructure/OutputController';
	import Pager from './Table/Components/Pager.svelte';
	import ResultsTable from './Table/Components/ResultsTable.svelte';

	export let controller: OutputController<PaginatedData>;

	controller.form?.on('form:change', (e) => {
		console.log('paginated-datacontroller', controller.value);
		controller.value = controller.value;
		key += 1;
	});

	// update the value of a prop to reload the component after the form has been submitted (not working) 
	let key = 1;
</script>

<ResultsTable {controller} type="paginated-data" {key} />

{#if controller.value?.Results?.length > 0}
	<div class="wrapper">
		<Pager {controller} />
	</div>
{/if}

<style lang="scss">
	.wrapper {
		margin-top: 1rem;
	}
</style>
