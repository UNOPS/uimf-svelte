<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export interface Option {
		CssClass: string;
		Icon: string;
		Label: string;
		Tooltip: string;
		Value: any;
	}

	export interface RadioMetadata extends ComponentMetadata {
		CustomProperties: {
			Options: Array<Option>;
		};
	}

	export class Radio {
		Value!: any;
	}

	export class Controller extends InputController<Radio, RadioMetadata> {
		public valueAsString: string | null = null;
		declare onChange: (() => any) | null;

		public getValue(): Promise<Radio | null> {
			var result =
				this.valueAsString != null && this.valueAsString.length > 0
					? { Value: parseInt(this.valueAsString) }
					: null;
			return Promise.resolve(result);
		}

		protected setValueInternal(value: Radio | null): Promise<void> {
			if (value == null) {
				this.valueAsString = null;
			} else {
				const asString = value?.Value.toString();
				this.valueAsString =
					this.metadata.CustomProperties.Options.find(
						(t) => t.Value.toString() === asString || t.Label === asString
					)?.Value.toString() ?? null;
			}

			this.onChange?.();

			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<Radio | null> {
			if (value == null || value == '') {
				return Promise.resolve(null);
			}

			var option = this.metadata.CustomProperties.Options.find((t) => t.Value.toString() === value);

			var result = option != null ? { Value: parseInt(value) } : null;

			return Promise.resolve(result);
		}

		public serialize(value: Radio | null): string | null {
			return value == null ? null : value.Value.toString();
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import uuid from '../Infrastructure/uuid';

	export let controller: Controller;
	export let onChange: null | (() => any) = null;

	let name: string = uuid();
	let withIcons: boolean;

	let component = new InputComponent({
		init() {
			controller.onChange = onChange;
			controller.ready?.resolve();
			withIcons = controller.metadata.CustomProperties.Options.find((t) => t.Icon != null) != null;
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class:with-icons={withIcons}>
	{#each controller.metadata.CustomProperties.Options as option}
		{@const selected = controller.valueAsString === option.Value.toString()}
		<label class={option.CssClass} class:selected class:not-selected={!selected}>
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
					on:click={(e) => controller.setValue(option.Value.toString())}
					><i class={option.Icon} /></button
				>
			{/if}
			{#if option.Label != null}
				<span>{option.Label}</span>
			{/if}
		</label>
	{/each}
</div>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	div {
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

	div.with-icons {
		white-space: nowrap;
		display: flexbox;

		& > label {
			display: inline-flex;
			flex-wrap: nowrap;
			justify-content: space-between;
			align-items: stretch;
			margin: 0 5px;
			border: 1px solid #ddd;
			cursor: pointer;

			&.not-selected {
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
</style>
