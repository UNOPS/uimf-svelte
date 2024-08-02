<script lang="ts" context="module">
	interface Configuration {
		Inner: IComponent;
		CssClass?: string;
	}

	interface IMetadata extends IFieldMetadata<Configuration> {
		CustomProperties: {
			cssClass: string;
		};
	}
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
						OrderIndex: 0,
						Required: false
					},
					data: item,
					form: controller.form!,
					app: controller.app
				})
			};
		});
	}
</script>

{#if nestedItems?.length > 0}
	<div
		class={controller.metadata.Component.Configuration?.CssClass ??
			controller.metadata.CustomProperties?.cssClass}
	>
		{#each nestedItems as item}
			<div>
				<svelte:component this={item.component} controller={item.controller} />
			</div>
		{/each}
	</div>
{/if}

<style>
	.line-separator > div {
		display: list-item;
		list-style-type: none;
		border-bottom: 0.1rem solid #4cb0e3;
		padding: 10px;
	}

	.bullet-list > div {
		display: list-item;
		list-style-type: circle;
		margin-left: 1.3em;
	}

	.line-separated-list > div {
		display: list-item;
		list-style-type: none;
		margin-left: 0em;
	}

	.label {
		font-weight: bold;
		font-size: medium;
		color: black;
		text-align: left;
		padding: 0.6em 0em 0em;
	}

	.comma-separated-list {
		& > div {
			display: inline;
		}

		& > div:last-child::after {
			content: none;
		}

		& > div::after {
			content: ', ';
		}
	}

	.space-separated-list {
		& > div {
			display: inline;
		}

		& > div:last-child::after {
			content: none;
		}

		& > div::after {
			content: ' ';
		}
	}
</style>
