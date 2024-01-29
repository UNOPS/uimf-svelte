<script context="module" lang="ts">
	export interface PaginatedData {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import type { OutputController } from '../Infrastructure/OutputController';
	import Pager from './Table/Components/Pager.svelte';
	import ResultsTable from './Table/Components/ResultsTable.svelte';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<PaginatedData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<ResultsTable {controller} type="paginated-data" />

{#if controller.value?.Results?.length > 0}
	<Pager {controller} />
{/if}
