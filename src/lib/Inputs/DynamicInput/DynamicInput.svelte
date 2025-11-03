<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
	import type { IComponent, IInputFieldMetadata } from '$lib/Infrastructure/Metadata';
	import { UrlSerializer } from '../../Infrastructure/Utilities/UrlSerializer';

	export interface ViewData {
		Metadata?: IComponent | null;
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
				return this.view.controller.getValue().then((value: any) => {
					if (value == null) {
						if (!this.metadata.Required) {
							return null;
						}
					}

					return {
						// We don't want to be sending metadata to the backend.
						Metadata: undefined,
						// But we do want to send the value.
						Value: value
					};
				});
			}

			// Return whatever is stored in the value field. This enables the
			// use case where DynamicInput was initialized based on a serialized
			// value (eg - from URL). Because serialized values don't have metadata,
			// `this.view` will initially be null, but `this.value` will still have
			// the underlying input's value stored.
			const result = this.value?.Value != null ? { Value: this.value.Value } : null;
			return Promise.resolve(result);
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			const result = UrlSerializer.deserialize<ViewData>(value);
			return Promise.resolve(result);
		}

		public serialize(value: ViewData | null): string | null {
			return UrlSerializer.serialize(value);
		}

		public override clear(): Promise<void> {
			if (this.view != null) {
				return this.view.controller.clear();
			}
			return Promise.resolve();
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			// If metadata is null then use current metadata. This essentially
			// means that calls to `setValue()` can pass the value without the metadata,
			// thereby reusing the current metadata.
			const metadata = value?.Metadata ?? this.view?.metadata;

			if (metadata != null) {
				this.value = {
					Metadata: metadata,
					Value: value?.Value
				};

				let controllerClass = controlRegister.inputs[metadata.Type].controller;

				this.view = {
					metadata: metadata,
					controller: new controllerClass({
						parent: this,
						metadata: {
							Component: metadata,
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
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import { InputComponent } from '../../Infrastructure/Component';

	export let controller: Controller;
	let innerComponent: any;

	let component = new InputComponent({
		refresh() {
			controller.view = controller.view;

			if (controller.value?.Metadata != null) {
				innerComponent = controlRegister.inputs[controller.value.Metadata.Type].component;
			} else {
				innerComponent = null;
			}
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

{#if controller.view?.controller != null && innerComponent != null}
	<svelte:component this={innerComponent} controller={controller.view.controller} />
{/if}
