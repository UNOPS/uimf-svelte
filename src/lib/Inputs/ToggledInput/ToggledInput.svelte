<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';

	interface IValue {
		Value: {
			Primary: any;
			Secondary: any;
		};
	}

	interface IMetadata extends IInputFieldMetadata {
		Primary: IFieldMetadata;
		Secondary: IFieldMetadata;
		PrimaryPickerText: string;
		SecondaryPickerText: string;
	}

	export class Controller extends InputController<IValue, IMetadata> {
		public primary: CreateInputResult;
		public secondary: CreateInputResult;
		public current?: InputController<any>;

		constructor(options: CreateInputOptions<IMetadata>) {
			super(options);

			this.primary = controlRegister.createInput({
				parent: this,
				app: this.app,
				form: this.form,
				metadata: this.metadata.Component.Configuration.Primary
			});

			this.secondary = controlRegister.createInput({
				parent: this,
				app: this.app,
				form: this.form,
				metadata: this.metadata.Component.Configuration.Secondary
			});

			this.current = this.primary.controller;
		}

		public async getValue(): Promise<IValue | null> {
			if (this.current == this.primary.controller) {
				return Promise.resolve({
					Value: {
						Primary: await this.primary.controller.getValue(),
						Secondary: null
					}
				});
			} else {
				return Promise.resolve({
					Value: {
						Primary: null,
						Secondary: await this.secondary.controller.getValue()
					}
				});
			}
		}

		public deserialize(value: string | null): Promise<IValue | null> {
			if (value == null || value.trim().length === 0) {
				return Promise.resolve(null);
			}

			const result: IValue = JSON.parse(value);

			return Promise.resolve(result);
		}

		public serialize(value: IValue | null): string | null {
			if (value == null) {
				return null;
			}

			return JSON.stringify(value);
		}

		protected async setValueInternal(value: IValue | null): Promise<void> {
			await this.primary.controller.setValue(value?.Value?.Primary);
			await this.secondary.controller.setValue(value?.Value?.Secondary);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IFieldMetadata, IInputFieldMetadata } from '../../Infrastructure/Metadata';
	import {
		defaultControlRegister as controlRegister,
		type CreateInputResult
	} from '../../Infrastructure/ControlRegister';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.current == controller.primary.controller}
	<button
		type="button"
		class="btn btn-link"
		on:click={() => (controller.current = controller.secondary.controller)}
		>{controller.metadata.Component.Configuration.PrimaryPickerText}</button
	>
	<svelte:component
		this={controller.primary.component}
		controller={controller.primary.controller}
	/>
{:else}
	<button
		type="button"
		class="btn btn-link"
		on:click={() => (controller.current = controller.primary.controller)}
		>{controller.metadata.Component.Configuration.SecondaryPickerText}</button
	>
	<svelte:component
		this={controller.secondary.component}
		controller={controller.secondary.controller}
	/>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	button.btn.btn-link {
		margin: 0;
		padding: 0;
		outline: none;
		font-size: 1em;
	}
</style>
