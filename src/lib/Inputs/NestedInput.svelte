<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';

	export interface ViewData {
		Value: { [key: string]: any };
	}

	export interface NestedComponentMetadata {
		CssClassEach: string;
		CssClass: string;
		Properties: IFieldMetadata[];
	}

	export class Controller extends InputController<
		ViewData,
		IFieldMetadata<NestedComponentMetadata>
	> {
		declare views: Array<{
			metadata: IFieldMetadata;
			controller: InputController<any>;
		}>;
	
		constructor(options: CreateInputOptions<IFieldMetadata<NestedComponentMetadata>>) {
			super(options);

			this.views = [];

			this.metadata.Component.Configuration.Properties.sort((x, y) => x.OrderIndex - y.OrderIndex);

			for (const view of this.metadata.Component.Configuration.Properties) {
				let controllerClass = controlRegister.inputs[view.Component.Type].controller;

				this.views.push({
					metadata: view,
					controller: new controllerClass({
						metadata: view,
						form: this.form,
						defer: null,
						app: this.app
					})
				});
			}
		}

		public getValue(): Promise<ViewData | null> {
			let effectiveValue: { [x: string]: any } = {};

			let allRequiredInputsHaveValues = true;

			let promises = this.views.map(function (view) {
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

				return { Value: effectiveValue };
			});
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			const innerValue = value != null && value.trim().length > 0 ? JSON.parse(value) : null;

			const outerValue = innerValue == null ? null : { Value: innerValue };

			return Promise.resolve(outerValue);
		}

		public serialize(value: ViewData | null): string | null {
			if (value == null) {
				return null;
			}

			return JSON.stringify(value);
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			let promises = [];

			this.value = value ?? { Value: {} };

			for (const view of this.views) {
				promises.push(view.controller.setValue(this.value.Value[view.metadata.Id] ?? null));
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
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.views = controller.views;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div class={controller.metadata.Component.Configuration?.CssClass}>
	{#each controller.views as view}
		<div class={controller.metadata.Component.Configuration?.CssClassEach}>
			<Input controller={view.controller} />
		</div>
	{/each}
</div>

<style>
	div {
		margin-bottom: 20px;
	}

	.column-200 {
		width: 200px;
	}

	.column-300 {
		width: 300px;
	}

	.column-700 {
		width: 700px;
	}
</style>
