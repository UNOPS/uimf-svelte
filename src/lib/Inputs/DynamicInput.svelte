<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { IComponent, IInputFieldMetadata } from '$lib/Infrastructure/uimf';

	export interface ViewData {
		Metadata: IComponent;
		Value: any;
	}

	export class Controller extends InputController<ViewData, IInputFieldMetadata> {
		public view: {
			metadata: IComponent;
			controller: InputController<any>;
		} | null = null;

		constructor(options: CreateInputOptions<IInputFieldMetadata>) {
			super(options);
		}

		public getValue(): Promise<ViewData | null> {
			if (this.view != null) {
				var self = this;

				return this.view.controller.getValue().then(function (value: any) {
					return {
						Metadata: self.view!.metadata,
						Value: value
					};
				});
			}

			return Promise.resolve(null);
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			return Promise.resolve(JSON.parse(value ?? 'null') as ViewData);
		}

		public serialize(value: ViewData | null): string | null {
			return JSON.stringify(value);
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			if (value != null) {
				this.value = value ?? { Value: {} };

				let type = value.Metadata.Type;

				let controllerClass = controlRegister.inputs[type].controller;

				this.view = {
					metadata: value.Metadata,
					controller: new controllerClass({
						metadata: {
							Component: value.Metadata,
							Hidden: false,
							Id: Date.now().toString(),
							Label: '',
							OrderIndex: 0,
							Required: false
						},
						form: this.form,
						app: this.app
					})
				};

				this.view.controller.setValue(this.value.Value);
			}

			return Promise.resolve();
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
			controller.view = controller.view;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

{#if controller.view?.controller != null}
	<div>
		<Input controller={controller.view.controller} nolayout={true} />
	</div>
{/if}

<style>
	div {
		margin-bottom: 20px;
	}
</style>
