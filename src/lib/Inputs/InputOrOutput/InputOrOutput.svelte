<script lang="ts" context="module">
	import type { CreateInputOptions } from '../../Infrastructure/InputController';
	import { InputController } from '../../Infrastructure/InputController';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';

	interface Configuration {
		Input: IComponent<any>;
		Output: IComponent<any>;
	}

	interface IData {
		Input: any;
		Output: any;
		Readonly: boolean;
	}

	export class Controller extends InputController<IData, IInputFieldMetadata<Configuration>> {
		public readonly input: InputController<any>;
		public readonly output: OutputController<any>;

		constructor(options: CreateInputOptions<IInputFieldMetadata<Configuration>>) {
			super(options);

			this.input = controlRegister.createInput({
				app: options.app,
				form: options.form,
				metadata: {
					Component: options.metadata.Component.Configuration.Input,
					Hidden: false,
					Id: options.metadata.Id + '_input',
					Label: '',
					OrderIndex: 0,
					Required: options.metadata.Required
				}
			}).controller;

			this.output = controlRegister.createOutput({
				props: {
					app: options.app,
					form: options.form,
					data: null,
					metadata: {
						Component: options.metadata.Component.Configuration.Output,
						Hidden: false,
						Id: options.metadata.Id + '_output',
						Label: '',
						OrderIndex: 0,
						HideIfNull: true
					},
					parent: null
				}
			}).controller;
		}

		public getValue(): Promise<IData | null> {
			return this.input.getValue().then((input) => {
				return {
					Input: input,
					Output: this.output.value,
					Readonly: this.value?.Readonly ?? false
				};
			});
		}

		public async deserialize(value: string | null): Promise<IData | null> {
			if (value == null || value === '') {
				return Promise.resolve(null);
			}

			const parsed = JSON.parse(value);

			return {
				Input: await this.input.deserialize(parsed.Input),
				Output: parsed.Output,
				Readonly: parsed.Readonly
			};
		}

		public serialize(value: IData | null): string | null {
			let inputSerialized: string | null;

			if (typeof value?.Input === 'string') {
				inputSerialized = value?.Input;
			} else {
				inputSerialized = this.input.serialize(value?.Input);
			}

			return JSON.stringify({
				Input: inputSerialized,
				Output: value?.Output,
				Readonly: value?.Readonly ?? false
			});
		}

		protected override setValueInternal(value: IData | null): Promise<void> {
			this.output.setValue(value?.Output);
			return this.input.setValue(value?.Input);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IComponent, IInputFieldMetadata } from '../../Infrastructure/Metadata';
	import { OutputController } from '../../Infrastructure/OutputController';
	import Input from '../../Input.svelte';
	import Output from '../../Output.svelte';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value?.Readonly !== true}
	<Input controller={controller.input} nolayout={true} />
{:else}
	<div class="form-control">
		<Output controller={controller.output} nolayout={true} />
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	:global(td) > .form-control {
		// Mark with gray background to indicate it is a readonly control.
		background: #f4f4f48a;
	}
</style>
