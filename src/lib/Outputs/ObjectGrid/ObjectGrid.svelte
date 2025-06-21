<script lang="ts" context="module">
	interface Configuration {
		Inner: IComponent;
		Gap?: string;
		CssClass?: string;
		Columns?: string;
		Rows?: string;
		ItemCssClass?: string;
	}

	interface IMetadata extends IOutputFieldMetadata<Configuration> {}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IComponent, IOutputFieldMetadata } from '../../Infrastructure/uimf';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/OutputFieldMetadataFactory';

	export let controller: OutputController<any, IMetadata>;

	class ComponentController {
		component: any;
		controller: any;
	}

	let nestedItems: ComponentController[] = [];

	if (controller.value?.Items != null) {
		nestedItems = getNestedItems(controller.value.Items);
	}

	let component = new OutputComponent({
		refresh() {
			if (controller.value?.Items != null) {
				nestedItems = getNestedItems(controller.value.Items);
			} else {
				nestedItems = [];
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getNestedItems(items: any[]): any[] {
		const inner = controller.metadata.Component.Configuration.Inner;

		if (controlRegister.outputs[inner.Type] == null) {
			throw new Error(`Unknown output type '${inner.Type}'.`);
		}

		return items.map((item) => {
			return {
				component: controlRegister.outputs[inner.Type].component,
				controller: new OutputController<any>({
					metadata: OutputFieldMetadataFactory.fromComponent(inner),
					data: item,
					form: controller.form!,
					app: controller.app,
					parent: controller
				})
			};
		});
	}
</script>

{#if nestedItems?.length > 0}
	<div
		class:object-grid={true}
		class={controller.metadata.Component.Configuration?.CssClass}
		style:gap={controller.metadata.Component.Configuration.Gap}
		style:grid-template-columns={controller.metadata.Component.Configuration.Columns}
		style:grid-template-rows={controller.metadata.Component.Configuration.Rows}
	>
		{#each nestedItems as item}
			<div class={controller.metadata.Component.Configuration.ItemCssClass}>
				<svelte:component this={item.component} controller={item.controller} />
			</div>
		{/each}
	</div>
{/if}

<style>
	.object-grid {
		display: grid;
	}
</style>
