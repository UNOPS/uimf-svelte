<script context="module" lang="ts">
	export interface Data {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import type { OutputController } from '../Infrastructure/OutputController';
	import ResultsTable, { TableMetadata } from './Table/Components/ResultsTable.svelte';

	export let controller: OutputController<Data, TableMetadata>;
</script>

<ResultsTable {controller} type="table" />
