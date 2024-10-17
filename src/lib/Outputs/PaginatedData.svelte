<script context="module" lang="ts">
	export interface PaginatedData {
		Results: any[];
		TotalCount: number;
		Actions: FormLinkData[];
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import FormLink, { type FormLinkData } from './FormLink.svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';
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

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>({
			metadata: {} as IFieldMetadata,
			data: value,
			form: controller.form!,
			app: controller.app,
			parent: controller
		}) as Controller;
	};

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class="actions">
	{#each controller.value.Actions as action}
		<div><FormLink controller={makeController(action)} /></div>
	{/each}
</div>

<ResultsTable {controller} type="paginated-data" />

{#if controller.value?.Results?.length > 0}
	<Pager {controller} />
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';
	.actions {
		display: flex;
		justify-content: right;
		background-color: $app-soft-bg;
		padding: 12px;
		border-width: 0px 0px 3px 0px;
		border-style: solid;
		border-color: #dadada;
	}
</style>
