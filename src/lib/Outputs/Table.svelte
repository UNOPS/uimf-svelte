<script context="module" lang="ts">
	export interface PaginatedData {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import type { OutputController } from '../Infrastructure/OutputController';
	import ResultsTable from './Table/Components/ResultsTable.svelte';

	export let controller: OutputController<PaginatedData>;
</script>

<ResultsTable {controller} type="paginated-data" />

<style lang="scss">
	.wrapper {
		margin-top: 1rem;
	}
</style>
