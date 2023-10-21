<script context="module" lang="ts">
	export interface Data {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import type { OutputController } from '../Infrastructure/OutputController';
	import ResultsTable from './Table/Components/ResultsTable.svelte';

	export let controller: OutputController<Data>;
</script>

<ResultsTable {controller} type="table" />
