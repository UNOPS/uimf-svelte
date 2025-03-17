<script lang="ts" context="module">
	interface Configuration {
		Inner: IComponent;
		Gap?: string;
		Wrap?: string;
		CssClass?: string;
		ItemPadding?: string;
		JustifyContent?: string;
		Direction?: string;
		AlignItems?: string;
		Separator?: string;
		ItemCssClass?: string;
	}

	interface IMetadata extends IFieldMetadata<Configuration> {}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent } from '$lib/Infrastructure/uimf';

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
					metadata: {
						Component: inner,
						Hidden: false,
						Id: Date.now().toString(),
						Label: '',
						OrderIndex: 0
					},
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
	{@const separator = controller.metadata.Component.Configuration?.Separator}
	<div
		class:object-flexbox={true}
		class={controller.metadata.Component.Configuration?.CssClass}
		style:gap={controller.metadata.Component.Configuration.Gap}
		style:flex-wrap={controller.metadata.Component.Configuration.Wrap}
		style:justify-content={controller.metadata.Component.Configuration.JustifyContent}
		style:flex-direction={controller.metadata.Component.Configuration.Direction}
		style:align-items={controller.metadata.Component.Configuration.AlignItems}
	>
		{#each nestedItems as item, index}
			<div class={controller.metadata.Component.Configuration.ItemCssClass}>
				<svelte:component this={item.component} controller={item.controller} />
			</div>
			{#if separator != null}
				{#if index < nestedItems.length - 1}
					<div>{@html separator}</div>
				{/if}
			{/if}
		{/each}
	</div>
{/if}

<style>
	.object-flexbox {
		display: flex;
	}
</style>
