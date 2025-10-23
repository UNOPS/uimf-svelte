<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
	import type { IInputFieldMetadata } from '../../Infrastructure/Metadata';

	export interface Option {
		Label: string;
		Value: string;
	}

	interface Configuration {
		CssClass: string;
		Options: Option[];
		Views: IInputFieldMetadata[];
		ConditionIsReadonly?: boolean;
		DefaultCondition: string | null;
	}

	interface ConditionalInputValue {
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
		ConditionalInputValue,
		IInputFieldMetadata<Configuration>
	> {
		public readonly views: View[] = [];

		public getValue(): Promise<ConditionalInputValue | null> {
			const condition = this.value?.Value?.Condition;

			if (condition == null) {
				return Promise.resolve(null);
			}

			const matchingView = this.views.find((t) => t.showIf === condition);

			if (matchingView == null) {
				return Promise.resolve({
					Value: {
						Condition: condition
					}
				});
			}

			return matchingView.controller.getValue().then((value: { Value: any }) => {
				return Promise.resolve({
					Value: {
						Condition: condition,
						[matchingView.controller.metadata.Id]: value
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
						parent: this,
						metadata: view,
						form: this.form,
						app: this.app
					})
				});
			}
		}

		/**
		 * Updates inner input's value.
		 * @param value
		 */
		setValueInternal(value: ConditionalInputValue | null): Promise<void> {
			const condition = value?.Value?.Condition;

			if (condition == null) {
				return Promise.resolve();
			}

			const view = this.views.find((t) => t.showIf === condition);

			if (view == null) {
				return Promise.resolve();
			}

			const viewValue = value?.Value[view.controller.metadata.Id];

			return view.controller.setValue(viewValue);
		}

		public deserialize(value: string | null): Promise<ConditionalInputValue | null> {
			return Promise.resolve(JSON.parse(value ?? 'null') as ConditionalInputValue);
		}

		public serialize(value: ConditionalInputValue | null): string | null {
			return JSON.stringify(value);
		}

		/**
		 * Changes the current condition without affecting the underlying
		 * views, which may already have some internal state/values.
		 * @param condition
		 */
		public changeCondition(condition: string): void {
			if (this.value == null) {
				this.value = {
					Value: {
						Condition: condition
					}
				};
			}

			if (this.value.Value == null) {
				this.value.Value = {
					Condition: condition
				};
			}

			this.value.Value.Condition = condition;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import { InputComponent } from '../../Infrastructure/Component';
	import uuid from '../../Infrastructure/Utilities/uuid';
	import Input from '../../Input.svelte';

	export let controller: Controller;

	let uniqueId: string = uuid();

	interface CurrentState {
		condition: string | null;
		view: InputController<any> | null;
	}

	let current: CurrentState = {
		condition: null,
		view: null
	};

	let component = new InputComponent({
		async init() {
			if (controller?.value?.Value?.Condition == null) {
				const condition = controller.metadata.Component.Configuration.DefaultCondition;
				await controller.setValue({
					Value: {
						Condition: condition
					}
				});
			}
		},
		async refresh() {
			const value = await controller.getValue();

			const condition =
				value?.Value?.Condition ?? controller.metadata.Component.Configuration.DefaultCondition;

			if (condition == null) {
				current = { condition: null, view: null };
			} else {
				current = {
					condition: condition,
					view: controller.views.find((t) => t.showIf === condition)?.controller ?? null
				};
			}

			controller = controller;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	async function changeCondition(newCondition: string) {
		const matchingView = controller.views.find((t) => t.showIf == newCondition);

		controller.changeCondition(newCondition);

		current = {
			condition: newCondition,
			view: matchingView?.controller ?? null
		};
	}
</script>

<div class={controller.metadata.Component.Configuration?.CssClass}>
	{#if controller.metadata.Component.Configuration.ConditionIsReadonly !== true}
		<div class="options">
			{#each controller.metadata.Component.Configuration.Options as option}
				{@const selected = current.condition === option.Value}
				<label class:selected class:not-selected={!selected}>
					<input
						type="radio"
						checked={selected}
						data-value={option.Value}
						on:change={async () => await changeCondition(option.Value)}
						required={true}
						name={uniqueId}
					/>
					<span>{option.Label}</span>
				</label>
			{/each}
		</div>
	{/if}

	{#if current.view != null}
		<Input controller={current.view} />
	{/if}
</div>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	.options {
		margin: 10px 0 30px 0;

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
