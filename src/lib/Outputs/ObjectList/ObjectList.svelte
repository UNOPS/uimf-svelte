<script lang="ts" context="module">
	interface Configuration {
		Inner: IComponent;
		CssClass?: string;
	}

	interface IMetadata extends IOutputFieldMetadata<Configuration> {
		CustomProperties: {
			cssClass: string;
		};
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent, IOutputFieldMetadata } from '../../Infrastructure/uimf';

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
						HideIfNull: false
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
	<div class={controller.metadata.Component.Configuration?.CssClass}>
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

	.extra-space-separator > div {
		display: list-item;
		list-style-type: none;
		margin-left: 0em;
		padding-bottom: 1em;
	}

	.bg-gray-box > div {
		background-color: #f4f4f4;
		padding: 0.5em;
		margin: 1em;
		border-color: #d2d2d2;
		border-style: solid;
		border-width: 1px;
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

	.section-separated-list {
		& > div {
			display: block;
			padding: 0px 0px;
			border-width: 1px;
			border-color: #d2d2d2;
			border-style: solid;
			margin: 0 0 25px 0;
			border-radius: 1px;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}

	.line-separated-list {
		& > div {
			display: block;
			border-bottom: 1px #d2d2d2 solid;
			margin: 0 0 25px 0;
			border-radius: 1px;
			list-style-type: none;
			margin-left: 0em;

			&:last-child {
				margin-bottom: 0;
				border-bottom: none;
			}
		}
	}

	.unstyled-list {
		& > div {
			display: block;
			list-style-type: none;
			margin-left: 0em;

			&:last-child {
				margin-bottom: 0;
				border-bottom: none;
			}
		}
	}

	.columns-8 {
		column-count: 8;
		column-gap: 1rem;
	}

	.columns-3 {
		column-count: 3;
		column-gap: 1rem;
	}
</style>
