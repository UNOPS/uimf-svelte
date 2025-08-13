<script context="module" lang="ts">
	import { InputController } from '../../Infrastructure/InputController';

	interface NumberRangeCustomProperty {
		MaxValue?: number;
		MinValue?: number;
		Step?: number;
		FormatPattern?: string;
		Unit?: string;
	}

	export class Controller extends InputController<NumberRange> {
		public minValue: number | null = null;
		public maxValue: number | null = null;
		public formatPattern: string | null = null;
		public unit: string | null = null;

		public getValue(): Promise<NumberRange | null> {
			var result = new NumberRange(
				this.minValue ?? null,
				this.maxValue ?? null,
				this.formatPattern,
				this.unit
			);

			return Promise.resolve(result);
		}

		public deserialize(value: string): Promise<NumberRange | null> {
			var result = NumberRange.parse(value);

			return Promise.resolve(result);
		}

		public serialize(value: NumberRange | null): string | null {
			return NumberRange.serialize(value);
		}

		protected setValueInternal(value: NumberRange): Promise<void> {
			this.minValue = value?.Min;
			this.maxValue = value?.Max;
			this.formatPattern = value?.FormatPattern;
			this.unit = value?.Unit;

			return Promise.resolve();
		}
	}

	class NumberRange {
		private static readonly nullValue = 'null';
		private static readonly separator = ',';

		public Min: number | null;
		public Max: number | null;
		public FormatPattern: string | null;
		public Unit: string | null;

		constructor(
			min: number | string | null,
			max: number | string | null,
			formatPattern: string | null,
			unit: string | null
		) {
			this.Min = NumberRange.toSafeNumber(min);
			this.Max = NumberRange.toSafeNumber(max);
			this.FormatPattern = formatPattern;
			this.Unit = unit;
		}

		private static toSafeNumber(value: number | string | null): number | null {
			if (value == null || value === '') {
				return null;
			}
			const cleanValue = String(value).replace(/[^\d.-]/g, '');
			const result = parseFloat(cleanValue);
			return isNaN(result) ? null : result;
		}

		public static serialize(value: NumberRange | null): string | null {
			if (value == null) return null;

			const min = value.Min ?? NumberRange.nullValue;
			const max = value.Max ?? NumberRange.nullValue;
			const formatPattern = value.FormatPattern ?? NumberRange.nullValue;
			const unit = value.Unit ?? NumberRange.nullValue;

			return `${min}${NumberRange.separator}${max}${NumberRange.separator}${formatPattern}${NumberRange.separator}${unit}`;
		}

		public static parse(value: string): NumberRange {
			if (!value) {
				return new NumberRange(null, null, null, null);
			}

			const parts = value.split(NumberRange.separator);
			const isNull = (part: string) => part === NumberRange.nullValue;

			const min = isNull(parts[0]) ? null : parseFloat(parts[0]);
			const max = isNull(parts[1]) ? null : parseFloat(parts[1]);
			const formatPattern = isNull(parts[2]) ? null : parts[2];
			const unit = isNull(parts[3]) ? null : parts[3];

			return new NumberRange(min, max, formatPattern, unit);
		}
	}
</script>

<script lang="ts">
	import { InputComponent } from '../../Infrastructure/Component';

	export let controller: Controller;

	let step = 1;
	let min = -Number.MAX_VALUE;
	let max = Number.MAX_VALUE;

	let minDisplayValue = '';
	let maxDisplayValue = '';
	let errorMessage = '';

	function validateValues(): void {
		if (
			controller.minValue !== null &&
			controller.maxValue !== null &&
			controller.minValue > controller.maxValue
		) {
			errorMessage = 'Minimum value must be less than maximum value';
		} else {
			errorMessage = '';
		}
	}

	function formatNumber(
		value: number | null,
		formatPattern: string | null,
		unit: string | null
	): string {
		if (value == null || isNaN(value)) return '';

		let formattedNumber = value.toString();

		if (formatPattern?.startsWith('regex:')) {
			const regexPattern = formatPattern.substring(6);
			const regex = new RegExp(regexPattern, 'g');
			formattedNumber = formattedNumber.replace(regex, ',');
		}

		return unit ? `${unit} ${formattedNumber}` : formattedNumber;
	}

	function parseFormattedNumber(value: string): number | null {
		if (!value?.trim()) return null;
		const cleanValue = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
		const result = parseFloat(cleanValue);
		return isNaN(result) ? null : result;
	}

	function handleInput(event: Event, type: 'min' | 'max') {
		const target = event.target as HTMLInputElement;
		const parsedValue = parseFormattedNumber(target.value);

		if (type === 'min') {
			if (parsedValue !== null && parsedValue < min) {
				errorMessage = `Minimum value cannot be less than ${min}`;
				return;
			}
			controller.minValue = parsedValue;
			minDisplayValue = target.value;
		} else {
			if (parsedValue !== null && parsedValue > max) {
				errorMessage = `Maximum value cannot be greater than ${max}`;
				return;
			}
			controller.maxValue = parsedValue;
			maxDisplayValue = target.value;
		}

		validateValues();
	}

	function handleBlur(type: 'min' | 'max') {
		if (type === 'min' && controller.minValue != null) {
			minDisplayValue = formatNumber(
				controller.minValue,
				controller.formatPattern,
				controller.unit
			);
		} else if (type === 'max' && controller.maxValue != null) {
			maxDisplayValue = formatNumber(
				controller.maxValue,
				controller.formatPattern,
				controller.unit
			);
		}
	}

	function updateDisplayValues() {
		minDisplayValue = formatNumber(controller.minValue, controller.formatPattern, controller.unit);
		maxDisplayValue = formatNumber(controller.maxValue, controller.formatPattern, controller.unit);
		validateValues();
	}

	const component = new InputComponent({
		init() {
			const config: NumberRangeCustomProperty = controller.metadata.Component?.Configuration;
			step = config?.Step ?? 1;
			min = config?.MinValue !== undefined ? config.MinValue : -Number.MAX_VALUE;
			max = config?.MaxValue !== undefined ? config.MaxValue : Number.MAX_VALUE;
			updateDisplayValues();
		},
		refresh() {
			const config: NumberRangeCustomProperty = controller.metadata.Component?.Configuration;
			step = config?.Step ?? 1;
			min = config?.MinValue !== undefined ? config.MinValue : -Number.MAX_VALUE;
			max = config?.MaxValue !== undefined ? config.MaxValue : Number.MAX_VALUE;
			updateDisplayValues();
		}
	});

	component.setup(controller);
</script>

<div class="wrapper">
	<input
		type="text"
		value={minDisplayValue}
		on:input={(e) => handleInput(e, 'min')}
		on:blur={() => handleBlur('min')}
		required={controller.metadata.Required}
		tabindex="0"
		{min}
		{max}
		class="form-control min"
		placeholder="Min"
	/>

	<input
		type="text"
		value={maxDisplayValue}
		on:input={(e) => handleInput(e, 'max')}
		on:blur={() => handleBlur('max')}
		required={controller.metadata.Required}
		tabindex="0"
		{min}
		{max}
		class="form-control max"
		placeholder="Max"
	/>
</div>

{#if errorMessage}
	<div class="error-message">
		{errorMessage}
	</div>
{/if}

{#if min !== -Number.MAX_VALUE || max !== Number.MAX_VALUE}
	<div class="range-helper">
		{#if min === -Number.MAX_VALUE && max === Number.MAX_VALUE}
			No range restrictions
		{:else if min === -Number.MAX_VALUE}
			Maximum value: {max}
		{:else if max === Number.MAX_VALUE}
			Minimum value: {min}
		{:else}
			Allowed range: {min} to {max}
		{/if}
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	.wrapper {
		display: flex;
		width: 100%;
		gap: 10px;

		& > input:first-child {
			margin-right: 5px;
		}
	}

	input.form-control {
		min-height: $app-input-min-height;
		font-size: inherit;
		flex: 1;
	}

	.error-message {
		color: #dc3545;
		font-size: 0.875rem;
		margin-top: 5px;
		padding: 5px 0;
	}

	.range-helper {
		color: #6c757d;
		font-size: 0.875rem;
		margin-top: 5px;
		font-style: italic;
	}
</style>
