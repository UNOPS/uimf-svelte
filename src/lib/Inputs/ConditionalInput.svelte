<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { IInputFieldMetadata } from '../Infrastructure/uimf';

	export interface Option {
		Label: string;
		Value: string;
	}

	interface Configuration {
		CssClass: string;
		Options: Option[];
		Views: IInputFieldMetadata[];
		ConditionIsReadonly?: boolean;
	}

	interface ConditionalInput {
		Value: {
			Condition: string | null;
			[field: string]: any;
		};
	}

	interface View {
		showIf: string;
		controller: InputController<any>;
	}

	export class Controller extends InputController<
		ConditionalInput,
		IInputFieldMetadata<Configuration>
	> {
		public condition: string | null = null;
		public view: InputController<any> | null = null;
		public readonly views: View[] = [];

		public getValue(): Promise<ConditionalInput | null> {
			if (this.condition == null) {
				return Promise.resolve(null);
			}

			if (this.view == null) {
				return Promise.resolve({
					Value: {
						Condition: this.condition
					}
				});
			}

			return this.view.getValue().then((value: { Value: any }) => {
				return Promise.resolve({
					Value: {
						Condition: this.condition,
						[this.view!.metadata.Id]: value
					}
				});
			});
		}

		constructor(options: CreateInputOptions<IInputFieldMetadata<Configuration>>) {
			super(options);

			this.views = [];

			for (const view of this.metadata.Component.Configuration.Views) {
				let controllerClass = controlRegister.inputs[view.Component.Type].controller;

				this.views.push({
					showIf: view.CustomProperties.showIfConditionIs,
					controller: new controllerClass({
						metadata: view,
						form: this.form,
						app: this.app
					})
				});
			}
		}

		setValueInternal(value: ConditionalInput | null): Promise<void> {
			if (value?.Value == null || value.Value.Condition == null) {
				this.condition = null;
				this.view = null;
				return Promise.resolve();
			}

			this.condition = value.Value.Condition;

			const matchingView = this.views.find((t) => t.showIf === this.condition);

			if (matchingView == null) {
				this.view = null;
				return Promise.resolve();
			}

			this.view = matchingView.controller;

			const matchingViewValue = value.Value[matchingView.controller.metadata.Id];

			return matchingView.controller.setValue(matchingViewValue);
		}

		public deserialize(value: string | null): Promise<ConditionalInput | null> {
			return Promise.resolve(JSON.parse(value ?? 'null') as ConditionalInput);
		}

		public serialize(value: ConditionalInput | null): string | null {
			return JSON.stringify(value);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { InputComponent } from '../Infrastructure/Component';
	import uuid from '../Infrastructure/uuid';
	import Input from '../Input.svelte';

	export let controller: Controller;
	let uniqueId: string = uuid();

	let component = new InputComponent({
		refresh() {
			controller = controller;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	function changeCondition(newCondition: string) {
		const newValue = JSON.parse(JSON.stringify(controller.value)) ?? {};

		if (newValue.Value == null) {
			newValue.Value = {};
		}

		newValue.Value.Condition = newCondition;

		controller.setValueInternal(newValue);

		controller = controller;
	}
</script>

<div class={controller.metadata.Component.Configuration?.CssClass}>
	{#if controller.metadata.Component.Configuration.ConditionIsReadonly !== true}
		{#each controller.metadata.Component.Configuration.Options as option}
			{@const selected = controller.condition === option.Value}
			<label class:selected class:not-selected={!selected}>
				<input
					type="radio"
					checked={selected}
					data-value={option.Value}
					on:change={() => changeCondition(option.Value)}
					required={true}
					name={uniqueId}
				/>
				<span>{option.Label}</span>
			</label>
		{/each}
	{/if}

	{#if controller.view != null}
		<Input controller={controller.view} />
	{/if}
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	div {
		display: block;

		& > label {
			display: block;
		}

		& > label > input {
			margin: 0px 4px 0px 0px;
			position: relative;
			top: 0px;
		}
	}
</style>
