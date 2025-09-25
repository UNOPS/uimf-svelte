<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	interface Configuration extends IPickerSourceConfig<RadioOption> {
		Options: string;
		OptionType: IComponent;
	}

	export interface RadioOption {
		CssClass: string;
		Icon: string;
		Label: string;
		Tooltip: string;
		Value: any;
	}

	export interface RadioMetadata extends IInputFieldMetadata<Configuration> {}

	export class Radio {
		Value!: any;
	}

	export class Controller extends InputController<Radio, RadioMetadata> {
		public valueAsString: string | null = null;
		declare onChange: (() => any) | null;

		public getValue(): Promise<Radio | null> {
			return Promise.resolve(this.value);
		}

		protected setValueInternal(value: Radio | null): Promise<void> {
			if (value == null || value.Value == '' || value.Value == null) {
				this.value = null;
				this.valueAsString = null;
			} else {
				this.valueAsString = this.serialize(this.value);
			}

			this.onChange?.();

			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<Radio | null> {
			if (value == null || value == '') {
				return Promise.resolve(null);
			}

			return Promise.resolve({ Value: value });
		}

		public serialize(value: Radio | null): string | null {
			return value != null && value.Value !== '' ? value.Value?.toString() : null;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type {
		IComponent,
		IInputFieldMetadata,
		IOutputFieldMetadata
	} from '../../Infrastructure/Metadata';
	import uuid from '../../Infrastructure/Utilities/uuid';
	import { PickerManager } from '../Typeahead/Domain';
	import { IPickerSourceConfig } from '../Typeahead/Domain/Picker/IPickerSourceConfig';
	import Output from '../../Output.svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';

	export let controller: Controller;
	export let onChange: null | (() => any) = null;

	let name: string = uuid();
	let withIcons: boolean;
	let source: PickerManager<RadioOption> | null;
	let items: RadioOption[] = [];
	let itemMetadata: IOutputFieldMetadata | null;

	let component = new InputComponent({
		init() {
			controller.onChange = onChange;

			const optionsField = controller.metadata.Component.Configuration.Options;

			if (optionsField == null) {
				source = new PickerManager(
					{
						...controller.metadata.Component.Configuration,
						ForDropdown: true
					},
					controller
				);

				itemMetadata = null;
			} else {
				itemMetadata = OutputFieldMetadataFactory.fromComponent(
					controller.metadata.Component.Configuration.OptionType
				);
			}
		},
		async refresh() {
			items =
				controller.metadata.Component.Configuration.Options == null
					? await source!.getOptionsAndFilter(null)
					: controller.form?.response[controller.metadata.Component.Configuration.Options]?.value ??
					  [];

			controller.value = controller.value;

			withIcons = items?.find((t) => t.Icon != null) != null;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function buildOutputController(value: any): OutputController<any> {
		return new OutputController({
			app: controller.app,
			data: value,
			form: controller.form,
			metadata: itemMetadata!,
			parent: controller
		});
	}
</script>

<div class:with-icons={withIcons} class:radio={true}>
	{#each items as option}
		{@const selected = controller.valueAsString === option.Value.toString()}
		{#if itemMetadata != null}
			<div class={option.CssClass} class:selected class:custom-output={true}>
				<div
					class="button"
					role="button"
					tabindex="0"
					on:click={() => controller.setValue(option)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							controller.setValue(option);
							e.preventDefault();
						}
					}}
				>
					<input
						type="radio"
						{name}
						checked={selected}
						data-value={option.Value}
						required={controller.metadata.Required}
					/>
				</div>

				<div class="details">
					<Output controller={buildOutputController(option)} />
				</div>
			</div>
		{:else}
			<label class={option.CssClass} class:selected>
				<input
					type="radio"
					{name}
					checked={selected}
					data-value={option.Value}
					on:change={() => controller.setValue(option)}
					required={controller.metadata.Required}
				/>

				{#if option.Icon != null}
					<button
						type="button"
						title={option.Tooltip}
						on:click={() => controller.setValue(option.Value)}><i class={option.Icon} /></button
					>
				{/if}
				{#if option.Label != null}
					<span>{option.Label}</span>
				{/if}
			</label>
		{/if}
	{/each}
</div>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	.radio {
		display: block;

		& > label {
			display: block;
		}

		input {
			margin: 0px 4px 0px 0px;
			position: relative;
			top: 0px;
		}
	}

	.radio.with-icons {
		white-space: nowrap;
		display: flex;

		& > label {
			display: inline-flex;
			flex-wrap: nowrap;
			justify-content: space-between;
			align-items: stretch;
			margin: 0 5px;
			border: 1px solid #ddd;
			cursor: pointer;

			&:not(.selected) {
				background: white;
				color: #5f5f5f;
			}

			&.selected > button {
				opacity: 0.2;
				background: #000;
				color: #fff;
			}

			& > button {
				padding: 5px 10px;
				background: #eee;
				border: none;
			}

			input {
				position: absolute;
				width: 0;
				height: 0;
			}
		}
	}

	.custom-output {
		--border: #d0d0d0;
		--bg: #ededed;

		&.selected {
			--border: var(--bs-primary);
			--bg: aliceblue;
		}

		border: 2px solid var(--border);
		border-radius: 5px;
		display: flex;
		flex-direction: row;

		& > .button {
			flex-basis: 60px;
			flex-grow: 0;
			flex-shrink: 0;
			border-right: 2px solid var(--border);
			cursor: pointer;
			background-color: var(--bg);

			// Make sure input is in the middle of the div (vertically).
			display: flex;
			align-items: center;

			& > input {
				display: block;
				width: 100%;
				height: 20px;
			}
		}

		& > .details {
			padding: 10px 15px;
		}
	}
</style>
