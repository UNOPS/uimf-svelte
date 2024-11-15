<script context="module" lang="ts">
	interface Data {
		Results: any[];
		TotalCount: number;
	}

	export type TableData = Data | [];
</script>

<script lang="ts">
	import type { OutputController } from '../Infrastructure/OutputController';
	import ResultsTable, { TableMetadata } from './Table/Components/ResultsTable.svelte';

	export let controller: OutputController<TableData, TableMetadata>;
</script>

<ResultsTable {controller} type="table" />
