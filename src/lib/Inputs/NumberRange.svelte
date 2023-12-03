<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	interface NumberRangeCustomProperty {
		MaxValue?: number;
		MinValue?: number;
		Step?: number;
	}

	export class Controller extends InputController<NumberRange> {
		public minValue: number | null = null;
		public maxValue: number | null = null;

		public getValue(): Promise<NumberRange | null> {
			var result = new NumberRange(this.minValue ?? null, this.maxValue ?? null);

			if (result.Min == null && result.Max == null) {
				return Promise.resolve(null);
			} else {
				result.Min = result.Min;
				result.Max = result.Max;
			}

			return Promise.resolve(result);
		}

		public deserialize(value: string): Promise<NumberRange | null> {
			var result = NumberRange.parse(value);

			if (result.Min == null && result.Max == null) {
				return Promise.resolve(null);
			}

			return Promise.resolve(result);
		}

		public serialize(value: NumberRange | null): string | null {
			return NumberRange.serialize(value);
		}

		protected setValueInternal(value: NumberRange): Promise<void> {
			this.minValue = value?.Min;
			this.maxValue = value?.Max;

			return Promise.resolve();
		}
	}

	class NumberRange {
		private static readonly nullValue: string = 'null';
		private static readonly separator: string = ',';

		constructor(min: number | string | null, max: number | string | null) {
			this.Min = NumberRange.getNumber(min);
			this.Max = NumberRange.getNumber(max);
		}

		private static getNumber(value: number | string | null): number | null {
			if (value == null || value === '') {
				return null;
			}

			if (typeof value === 'string') {
				var result = parseFloat(value);

				if (isNaN(result)) {
					return null;
				}

				return result;
			}

			return value;
		}

		public static serialize(value: NumberRange | null) {
			if (value == null) {
				return null;
			}

			if (value.Min == null && value.Max == null) {
				return null;
			}

			var min = value.Min != null ? value.Min : NumberRange.nullValue;
			var max = value.Max != null ? value.Max : NumberRange.nullValue;

			return `${min}${NumberRange.separator}${max}`;
		}

		public static parse(value: string): NumberRange {
			if (value == null || value == '') {
				return new NumberRange(null, null);
			}

			var parsedValue;

			if (typeof value === 'string') {
				var parts = value.split(NumberRange.separator);

				parsedValue = {
					min: parts[0] === NumberRange.nullValue || parts[0] == null ? null : parseFloat(parts[0]),
					max: parts[1] === NumberRange.nullValue || parts[1] == null ? null : parseFloat(parts[1])
				};
			} else {
				parsedValue = value;
			}

			return new NumberRange(parsedValue.min, parsedValue.max);
		}

		public Min: number | null = null;
		public Max: number | null = null;
	}
</script>

<script lang="ts">
	import { InputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';

	export let controller: Controller;

	let step: number = 1;
	let min: number;
	let max: number;

	const component = new InputComponent({
		init() {
			const config: NumberRangeCustomProperty = controller.metadata.CustomProperties?.number;
			
            step = config?.Step ?? 1;
			min = config?.MinValue ?? -Number.MAX_VALUE;
			max = config?.MaxValue ?? Number.MAX_VALUE;

			controller.ready?.resolve();
		},
		refresh() {
			controller.minValue = controller.minValue;
			controller.maxValue = controller.maxValue;
		}
	});

	beforeUpdate(() => component.setup(controller));
</script>

<div class="wrapper">
	<input
		type="number"
		bind:value={controller.minValue}
		required={controller.metadata.Required}
		tabindex="0"
		{step}
		{min}
		{max}
		class="form-control min"
	/>

	<input
		type="number"
		bind:value={controller.maxValue}
		required={controller.metadata.Required}
		tabindex="0"
		{step}
		{min}
		{max}
		class="form-control max"
	/>
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.wrapper {
		display: flex;
		width: 100%;

		& > input:first-child {
			margin-right: 5px;
		}
	}

	input.form-control {
		min-height: $app-input-min-height;
	}
</style>
