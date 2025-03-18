<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { IInputFieldMetadata } from '$lib/Infrastructure/uimf';

	export type ViewData = { [key: string]: any };

	export interface NestedComponentMetadata {
		Fields: FlexboxItemMetadata[];
		Gap?: string;
		Wrap?: string;
		CssClass?: string;
		ItemPadding?: string;
		JustifyContent?: string;
		Direction?: string;
		AlignItems?: string;
	}

	interface FlexboxItemMetadata extends IInputFieldMetadata {
		CustomProperties?: {
			Flexbox?: {
				FlexBasis?: string;
				FlexGrow?: string;
				FlexShrink?: string;
				CssClass?: string;
				MinWidth?: string;
			};
		};
	}

	export class Controller extends InputController<
		ViewData,
		IInputFieldMetadata<NestedComponentMetadata>
	> {
		declare fields: Array<{
			metadata: IInputFieldMetadata;
			controller: InputController<any>;
		}>;

		constructor(options: CreateInputOptions<IInputFieldMetadata<NestedComponentMetadata>>) {
			super(options);

			this.fields = [];

			this.metadata.Component.Configuration.Fields.sort((x, y) => x.OrderIndex - y.OrderIndex);

			for (const view of this.metadata.Component.Configuration.Fields) {
				let controllerClass = controlRegister.inputs[view.Component.Type].controller;

				this.fields.push({
					metadata: view,
					controller: new controllerClass({
						metadata: view,
						form: this.form,
						app: this.app
					})
				});
			}
		}

		public getValue(): Promise<ViewData | null> {
			let effectiveValue: { [x: string]: any } = {};

			let allRequiredInputsHaveValues = true;

			let promises = this.fields.map(function (view) {
				return view.controller.getValue().then(function (value: any) {
					if (value == null && view.metadata.Required) {
						allRequiredInputsHaveValues = false;
					}

					effectiveValue[view.metadata.Id] = value;
				});
			});

			return Promise.all(promises).then(function () {
				if (allRequiredInputsHaveValues === false) {
					return null;
				}

				return effectiveValue;
			});
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			const parsed = value != null && value.trim().length > 0 ? JSON.parse(value) : null;

			return Promise.resolve(parsed);
		}

		public serialize(value: ViewData | null): string | null {
			if (value == null) {
				return null;
			}

			return JSON.stringify(value);
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			let promises = [];

			this.value = value ?? {};

			for (const view of this.fields) {
				promises.push(view.controller.setValue(this.value[view.metadata.Id] ?? null));
			}

			return Promise.all(promises).then(() => {
				return Promise.resolve();
			});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { InputComponent } from '../Infrastructure/Component';
	import Input from '../Input.svelte';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.fields = controller.fields;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div
	class:flex-container={true}
	class={controller.metadata.Component.Configuration.CssClass}
	style:gap={controller.metadata.Component.Configuration.Gap}
	style:flex-wrap={controller.metadata.Component.Configuration.Wrap}
	style:justify-content={controller.metadata.Component.Configuration.JustifyContent}
	style:flex-direction={controller.metadata.Component.Configuration.Direction}
	style:align-items={controller.metadata.Component.Configuration.AlignItems}
>
	{#each controller.fields as field}
		<div
			class={field.controller.metadata.CustomProperties?.Flexbox?.CssClass}
			style:flex-basis={field.controller.metadata.CustomProperties?.Flexbox?.FlexBasis}
			style:flex-grow={field.controller.metadata.CustomProperties?.Flexbox?.FlexGrow}
			style:flex-shrink={field.controller.metadata.CustomProperties?.Flexbox?.FlexShrink}
			style:min-width={field.controller.metadata.CustomProperties?.Flexbox?.MinWidth}
		>
			<Input controller={field.controller} />
		</div>
	{/each}
</div>

<style>
	.flex-container {
		display: flex;
	}
</style>
