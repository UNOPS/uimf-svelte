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
	import type { FormLinkData } from './FormLink.svelte';
	import type { TableMetadata } from './Table/Components/ResultsTable.svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import ResultsTable from './Table/Components/ResultsTable.svelte';

	export let controller: OutputController<TableData | [], TableMetadata>;
	let effectiveController: OutputController<TableData, TableMetadata>;

	let component = new OutputComponent({
		refresh() {
			effectiveController = new OutputController<TableData, TableMetadata>({
				data:
					controller.value?.length != null
						? { Results: controller.value, TotalCount: controller.value.length, Actions: [] }
						: controller.value,
				metadata: controller.metadata,
				app: controller.app,
				parent: controller.parent,
				form: controller.form
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if effectiveController != null}
	<ResultsTable controller={effectiveController} type="table" />
{/if}
