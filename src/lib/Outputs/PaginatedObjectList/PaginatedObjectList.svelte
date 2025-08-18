<script lang="ts" context="module">
	interface PaginatedObjectList {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import Pager from '../Table/Components/Pager.svelte';
	import type { IComponent } from '$lib/Infrastructure/Metadata';
	import type { TableConfiguration, TableMetadata } from '../Table/Components/ResultsTable.svelte';

	export let controller: OutputController<PaginatedObjectList, TableMetadata<Configuration>>;

	interface Configuration extends TableConfiguration {
		Item: IComponent;
	}

	let nestedComponentType = controller.metadata.Component.Configuration!.Item.Type;
	let nestedComponent = controlRegister.outputs[nestedComponentType].component;

	let nestedControllers: OutputController<any>[];

	let component = new OutputComponent({
		async refresh() {
			nestedControllers = createNestedControllers(controller.value?.Results);
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function createNestedControllers(results: any[]) {
		let controllerArray: OutputController<any>[] = [];
		if (results != null) {
			results.forEach((result) => {
				let childController = new OutputController<any>({
					metadata: controller.metadata,
					data: null,
					form: controller.form!,
					app: controller.app,
					parent: controller
				});

				childController.setValue(result);
				controllerArray.push(childController);
			});
		}

		return controllerArray;
	}
</script>

<div class="list-container">
	{#if nestedControllers != null}
		{#each nestedControllers as controller}
			{#if controller.value}
				<svelte:component this={nestedComponent} {controller} />
			{/if}
		{/each}
	{/if}
</div>
{#if controller.value?.Results?.length > 0 && controller.metadata.Component.Configuration.Paginator != null}
	<Pager {controller} />
{/if}

<style>
	.list-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
	}
</style>
