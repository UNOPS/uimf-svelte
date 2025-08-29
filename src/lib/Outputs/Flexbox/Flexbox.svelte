<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { InputController } from '../../Infrastructure/InputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IOutputFieldMetadata, IInputFieldMetadata } from '../../Infrastructure/Metadata';
	import Output from '../../Output.svelte';
	import Input from '../../Input.svelte';

	interface Configuration {
		Fields: (IOutputFieldMetadata | IInputFieldMetadata)[];
		Gap?: string;
		Wrap?: string;
		CssClass?: string;
		ItemPadding?: string;
		JustifyContent?: string;
		Direction?: string;
		AlignItems?: string;
	}

	interface FlexboxItem {
		isInput: boolean;
		component: any;
		controller: any;
		metadata: IOutputFieldMetadata | IInputFieldMetadata;
	}

	class FlexboxController extends OutputController<any, IOutputFieldMetadata<Configuration>> {}

	export let controller: FlexboxController;

	let fields: FlexboxItem[] = [];

	let component = new OutputComponent({
		refresh() {
			fields = getComponentControllers();

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(): FlexboxItem[] {
		return controller.metadata.Component.Configuration.Fields.sort(
			(a: { OrderIndex: number; }, b: { OrderIndex: number; }) => a.OrderIndex - b.OrderIndex
		).map((itemMetadata: { Id: string | number; }) => {
			// Prefer the Required property to determine input vs output
			const isInput = typeof (itemMetadata as any).Required === 'boolean';
			let field;
			if (isInput) {
				field = controlRegister.createInput({
					metadata: itemMetadata as IInputFieldMetadata,
					app: controller.app,
					form: controller.form,
					parent: controller

				});
			} else {
				field = controlRegister.createOutput({
					props: {
						metadata: itemMetadata as IOutputFieldMetadata,
						app: controller.app,
						form: controller.form,
						data: null,
						parent: controller
					}
				});
			}
			if (!isInput && controller.value != null) {
				field.controller.setValue(controller.value[itemMetadata.Id]);
			}
			return {
				isInput,
				component: field,
				controller: field.controller,
				metadata: itemMetadata
			};
		});
	}
</script>

{#if fields?.length > 0}
	<div
		class:flex-container={true}
		class={controller.metadata.Component.Configuration.CssClass}
		style:gap={controller.metadata.Component.Configuration.Gap}
		style:flex-wrap={controller.metadata.Component.Configuration.Wrap}
		style:justify-content={controller.metadata.Component.Configuration.JustifyContent}
		style:flex-direction={controller.metadata.Component.Configuration.Direction}
		style:align-items={controller.metadata.Component.Configuration.AlignItems}
	>
		{#each fields as field}
			<div
				class={field.metadata.CustomProperties?.Flexbox?.CssClass}
				style:flex-basis={field.metadata.CustomProperties?.Flexbox?.FlexBasis}
				style:flex-grow={field.metadata.CustomProperties?.Flexbox?.FlexGrow}
				style:flex-shrink={field.metadata.CustomProperties?.Flexbox?.FlexShrink}
				style:min-width={field.metadata.CustomProperties?.Flexbox?.MinWidth}
				class:d-none={field.metadata.CustomProperties?.Flexbox?.HideIfNull &&
					field.controller.value == null}
			>
				{#if field.isInput}
					<Input controller={field.controller} />
				{:else}
					<Output controller={field.controller} />
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	h3 {
		padding: 5px 10px;
		border-bottom: 2px solid #cbdce9;
		font-weight: 400;
		font-size: 1.1em;
	}

	.flex-container {
		display: flex;
		width: 100%;
	}

	.boxed {
		background-color: #ffffff;
		border: 1px solid #d1d1d1;
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
		height: fit-content;
	}

	.height700 {
		height: 750px;
	}

	/* Every flexbox item will be styled as a panel */
	.panels {
		gap: 20px;
		flex-wrap: wrap;

		& > div {
			border: 1px solid var(--bs-border-color);
			padding: 0;
			background: white;

			& > :global(div > label) {
				font-size: 1.8rem;
				display: block;
				background: var(--bs-soft);
				padding: 5px 25px;
				margin: 0 0 15px 0;
			}
		}
	}
</style>