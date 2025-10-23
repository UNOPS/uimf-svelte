<script lang="ts" context="module">
	import type { CreateInputOptions } from '../../Infrastructure/InputController';
	import { InputController } from '../../Infrastructure/InputController';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';

	interface Configuration {
		Parent: IComponent<any>;
		Child: IComponent<any>;
	}

	interface IData {
		Parent: any;
		Child: any;
	}
	export class Controller extends InputController<IData, IInputFieldMetadata<Configuration>> {
		public readonly inputParent: InputController<any>;
		public readonly inputChild: InputController<any>;

		constructor(options: CreateInputOptions<IInputFieldMetadata<Configuration>>) {
			super(options);

			this.inputParent = controlRegister.createInput({
				parent: this,
				app: options.app,
				form: options.form,
				metadata: {
					Component: options.metadata.Component.Configuration.Parent,
					Hidden: false,
					Id: options.metadata.Id + '_parent',
					Label: '',
					OrderIndex: 0,
					Required: options.metadata.Required
				}
			}).controller;

			this.inputChild = controlRegister.createInput({
				parent: this,
				app: options.app,
				form: options.form,
				metadata: {
					Component: options.metadata.Component.Configuration.Child,
					Hidden: false,
					Id: options.metadata.Id + '_child',
					Label: '',
					OrderIndex: 1,
					Required: options.metadata.Required
				}
			}).controller;
		}

		public getValue(): Promise<IData | null> {
			return Promise.all([this.inputParent.getValue(), this.inputChild.getValue()]).then(
				([parentVal, childVal]) => {
					return {
						Parent: parentVal,
						Child: childVal
					};
				}
			);
		}

		public async deserialize(value: string | null): Promise<IData | null> {
			if (!value) return Promise.resolve(null);

			const parsed = JSON.parse(value);

			const parentVal = await this.inputParent.deserialize(parsed.Parent);
			const childVal = await this.inputChild.deserialize(parsed.child);

			return {
				Parent: parentVal,
				Child: childVal
			};
		}

		public serialize(value: IData | null): string | null {
			const parentSerialized =
				typeof value?.Parent === 'string'
					? value.Parent
					: this.inputParent.serialize(value?.Parent);

			const childSerialized =
				typeof value?.Child === 'string' ? value.Child : this.inputChild.serialize(value?.Child);

			return JSON.stringify({
				Parent: parentSerialized,
				Child: childSerialized
			});
		}

		protected override setValueInternal(value: IData | null): Promise<void> {
			return Promise.all([
				this.inputParent.setValue(value?.Parent),
				this.inputChild.setValue(value?.Child)
			]).then(() => {});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IComponent, IInputFieldMetadata } from '../../Infrastructure/Metadata';
	import Input from '../../Input.svelte';
	import { onMount } from 'svelte';

	export let controller: Controller;
	let show = false;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	onMount(async () => {
		let nestedComponentCurrentValue = await controller.inputParent.getValue();
		show = !!nestedComponentCurrentValue?.Value;
	});

	controller.inputParent.on('input:change', async function () {
		let nestedComponentValue = await controller.inputParent?.getValue();
		show = nestedComponentValue != null;
	});
</script>

<div class="input-container">
	<Input controller={controller.inputParent} nolayout={true} />
	<div class="child-wrapper" class:hidden={!show}>
		<Input controller={controller.inputChild} nolayout={false} />
	</div>
</div>

<style lang="scss">
	.input-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.child-wrapper.hidden {
		visibility: hidden;
		height: 0;
		overflow: hidden;
	}
</style>
