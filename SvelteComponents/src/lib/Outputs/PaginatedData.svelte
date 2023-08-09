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
</script>

<ResultsTable {controller} type="paginated-data" />

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
