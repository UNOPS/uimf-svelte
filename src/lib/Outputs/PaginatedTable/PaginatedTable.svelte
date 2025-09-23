<script context="module" lang="ts">
	export interface IPaginatedData extends TableData {
		TotalCount: number;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { IFormLinkData } from '../FormLink/FormLink.svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import Pager from '../Table/Components/Pager.svelte';
	import ResultsTable, { type TableMetadata } from '../Table/Components/ResultsTable.svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { TableData } from '../Table/Table.svelte';

	export let controller: OutputController<IPaginatedData, TableMetadata>;
	export class Controller extends OutputController<IFormLinkData> {}

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<ResultsTable {controller} type="paginated-table" />

{#if controller.value?.Results?.length > 0 && controller.metadata.Component.Configuration.Paginator != null}
	<Pager {controller} />
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';
</style>
