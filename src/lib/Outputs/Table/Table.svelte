<script context="module" lang="ts">
	export interface TableData {
		Results: any[];
		Actions: FormLinkData[];
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { OutputController } from '../../Infrastructure/OutputController';
	import type { FormLinkData } from '../FormLink/FormLink.svelte';
	import type { TableMetadata } from './Components/ResultsTable.svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import ResultsTable from './Components/ResultsTable.svelte';

	export let controller: OutputController<TableData | [], TableMetadata>;
	let effectiveController: OutputController<TableData, TableMetadata>;

	let component = new OutputComponent({
		refresh() {
			effectiveController = new OutputController<TableData, TableMetadata>({
				data: Array.isArray(controller.value)
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
