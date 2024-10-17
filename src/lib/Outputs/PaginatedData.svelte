<script context="module" lang="ts">
	export interface PaginatedData {
		Results: any[];
		TotalCount: number;
		Actions: FormLinkData[];
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { type FormLinkData } from './FormLink.svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import Pager from './Table/Components/Pager.svelte';
	import ResultsTable, { type TableMetadata } from './Table/Components/ResultsTable.svelte';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<PaginatedData, TableMetadata>;
	export class Controller extends OutputController<FormLinkData> {}

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<ResultsTable {controller} type="paginated-data" />

{#if controller.value?.Results?.length > 0 && controller.metadata.Component.Configuration.Paginator != null}
	<Pager {controller} />
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';
</style>
