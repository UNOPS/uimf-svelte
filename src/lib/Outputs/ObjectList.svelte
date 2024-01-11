<script lang="ts" context="module">
	interface IMetadata extends ComponentMetadata {
		Items: any[];

		CustomProperties: {
			ItemTypes: ComponentMetadata;
			cssClass: string;
		};
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export let controller: OutputController<any, IMetadata>;

	class ComponentController {
		component: any;
		controller: any;
	}

	let componentControllers: ComponentController[] = [];

	if (controller.value?.Items != null) {
		componentControllers = getComponentControllers(controller.value.Items);
	}

	let component = new OutputComponent({
		refresh() {
			if (controller.value?.Items != null) {
				componentControllers = getComponentControllers(controller.value.Items);
			} else {
				componentControllers = [];
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(items: any[]): any[] {
		const inner = controller.metadata.CustomProperties.ItemTypes;

		if (controlRegister.outputs[inner.Type] == null) {
			throw new Error(`Unknown output type '${inner.Type}'.`);
		}

		return items.map((item) => {
			let componentController = {
				component: controlRegister.outputs[inner.Type].component,
				controller: new OutputController<any>({
					metadata: inner,
					data: item,
					form: controller.form!,
					app: controller.app
				})
			};

			return componentController;
		});
	}
</script>

{#if componentControllers?.length > 0}
	{#each componentControllers as componentController}
		<div class={componentController.controller.metadata.CustomProperties.cssClass}>
			<svelte:component
				this={componentController.component}
				controller={componentController.controller}
			/>
		</div>
	{/each}
{/if}

<style>
	.line-separator {
		display: list-item;
		list-style-type: none;
		border-bottom: 0.1rem solid #4cb0e3;
		padding: 10px;
	}

	.bullet-list {
		display: list-item;
		list-style-type: circle;
		margin-left: 1.3em;
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
</style>
