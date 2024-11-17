<script context="module" lang="ts">
	interface Data {
		Results: any[];
		TotalCount: number;
		Actions: FormLinkData[];
	}

	export type TableData = Data;
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { OutputController } from '../Infrastructure/OutputController';
	import { FormLinkData } from './FormLink.svelte';
	import ResultsTable, { TableMetadata } from './Table/Components/ResultsTable.svelte';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<TableData | [], TableMetadata>;
	let effectiveController: OutputController<TableData, TableMetadata>;

	let component = new OutputComponent({
		refresh() {
			controller.value = new OutputController<TableData, TableMetadata>({
				data:
					controller.value?.lenth != null
						? { Results: controller.value, TotalCount: controller.value.length, Actions: [] }
						: controller.value,
				metadata: controller.metadata,
				app: controller.app,
				parent: controller.parent,
				form: controller.form
			}).value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if effectiveController != null}
	<ResultsTable controller={effectiveController} type="table" />
{/if}
