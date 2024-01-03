<script lang="ts" context="module">
	import {
		InputController,
		type CreateInputOptions
	} from '../Infrastructure/InputController';
	import type { ComponentMetadata, NestedComponentMetadata } from '../Infrastructure/uimf';

	export interface Option {
		Label: string;
		Value: string;
	}

	export interface ConditionalMetadata extends ComponentMetadata {
		CustomProperties: {
			Options: Array<Option>;
			Views: NestedComponentMetadata[];
			ConditionIsReadonly: boolean;
		};
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

	export class Controller extends InputController<ConditionalInput, ConditionalMetadata> {
		public condition: string | null = null;
		public view: InputController<any> | null = null;
		public readonly views: View[] = [];

		public getValue(): Promise<ConditionalInput | null> {
			if (this.condition == null || this.view == null) {
				return Promise.resolve(null);
			}

			var self = this;

			return this.view.getValue().then((value: { Value: any }) => {
				return Promise.resolve({
					Value: {
						Condition: self.condition,
						[self.view!.metadata.Id]: value
					}
				});
			});
		}

		constructor(options: CreateInputOptions<ConditionalMetadata>) {
			super(options);

			this.views = [];

			for (const view of this.metadata.CustomProperties.Views) {
				let controllerClass = controlRegister.inputs[view.Type].controller;

				this.views.push({
					showIf: view.CustomProperties.showIfConditionIs,
					controller: new controllerClass({
						metadata: view,
						form: this.form,
						defer: null,
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
				throw `Cannot find view for condition '${this.condition}'.`;
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

		public changeCondition(newCondition: string) {
			this.condition = newCondition;

			const matchingView = this.views.find((t) => t.showIf === this.condition);

			if (matchingView == null) {
				throw `Cannot find view for condition '${this.condition}'.`;
			}

			this.view = matchingView.controller;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { InputComponent } from '../Infrastructure/Component';
	import type IUimfApp from '$lib/Infrastructure/UimfApp';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller = controller;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	function changeCondition(newCondition: any) {
		controller.changeCondition(newCondition);
		controller = controller;
	}
</script>

<div>
	{#if controller.metadata.CustomProperties.ConditionIsReadonly !== true}
		{#each controller.metadata.CustomProperties.Options as option}
			{@const selected = controller.condition === option.Value}
			<label class:selected class:not-selected={!selected}>
				<input
					type="radio"
					checked={selected}
					data-value={option.Value}
					on:change={() => changeCondition(option.Value)}
					required={true}
				/>
				<span>{option.Label}</span>
			</label>
		{/each}
	{/if}

	{#if controller.view != null}
		<svelte:component
			this={controlRegister.inputs[controller.view.metadata.Type].component}
			controller={controller.view}
		/>
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
