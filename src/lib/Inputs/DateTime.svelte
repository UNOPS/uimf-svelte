<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface DateMetadata extends IInputFieldMetadata<IConfiguration> {
		CustomProperties: {
			[propertyName: string]: any;
		};
	}

	interface IConfiguration {
		MinDateValue?: string | null;
		MaxDateValue?: string | null;
	}

	export class Controller extends InputController<Date, DateMetadata> {
		public valueAsString: string | null = null;

		public async getValue(): Promise<Date | null> {
			const value = await this.deserialize(this.valueAsString);

			var utc = this.convertToUtc(value);

			return Promise.resolve(utc);
		}

		protected setValueInternal(value: Date | null): Promise<void> {
			this.valueAsString = this.serialize(value);

			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<Date | null> {
			if (value == null || value.trim().length == 0) {
				return Promise.resolve(null);
			}

			var result = this.convertToUtc(new Date(value));

			return Promise.resolve(result);
		}

		public serialize(value: Date | null): string | null {
			if (value == null) {
				return null;
			}

			return (
				value.getFullYear() +
				'-' +
				(value.getMonth() + 1).toString().padStart(2, '0') +
				'-' +
				value.getDate().toString().padStart(2, '0')
			);
		}

		ToValidDateString(date: Date | string | null): string | null {
			if (date == null) {
				return null;
			}

			return this.convertToUtc(new Date(date))?.toISOString().split('T')[0] ?? null;
		}

		/**
		 * Removes browser's automatic timezone adjustments, by converting the date into
		 * the UTC timezone.
		 * @param {Date} date the date to convert.
		 */
		convertToUtc(date: Date | null) {
			if (date == null) {
				return null;
			}

			let serialized =
				date.getFullYear() +
				'-' +
				(date.getMonth() + 1).toString().padStart(2, '0') +
				'-' +
				date.getDate().toString().padStart(2, '0') +
				'T00:00:00.000Z';

			return new Date(serialized);
		}

		public static parseDefaultValue(
			value: string | null | undefined,
			form: FormInstance | null | undefined
		): Date | null {
			if (value == null || value === '') {
				return null;
			}

			// If value is an offset in days like `now+1` or `now-1`.
			if (value.indexOf('now+') == 0 || value.indexOf('now-') == 0) {
				const offset = value.length > 3 ? value.substring(4) : '0';

				const offsetAsDays = parseInt(offset);

				let result = new Date();
				result.setDate(result.getDate() + offsetAsDays);
				return result;
			}

			// If value is a date string in the format like `yyyy-MM-dd`
			if (value.indexOf('-') != -1) {
				var asInt = Date.parse(value);
				return new Date(asInt);
			}

			// If value is name of the response field.
			var date = form?.response[value]?.value;
			return date;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { IInputFieldMetadata } from '../Infrastructure/uimf';
	import { tooltip } from '../Components/Tooltip.svelte';
	import { FormInstance } from '../Infrastructure/FormController';

	export let controller: Controller;

	let initialised = false;
	let defaultValue: Date | null;

	let minDateString: string | null;
	let maxDateString: string | null;

	let component = new InputComponent({
		init() {
			defaultValue = Controller.parseDefaultValue(
				controller.metadata.DefaultValue,
				controller.form
			);
		},
		refresh() {
			if (!initialised && defaultValue != null) {
				controller.setValue(defaultValue);
				initialised = true;
			}

			const config = controller.metadata.Component?.Configuration;

			let minDate = Controller.parseDefaultValue(config?.MinDateValue, controller.form);
			let maxDate = Controller.parseDefaultValue(config?.MaxDateValue, controller.form);

			minDateString = controller.ToValidDateString(minDate);
			maxDateString = controller.ToValidDateString(maxDate);

			controller.valueAsString = controller.valueAsString;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getTooltipMessage(minDateString: string | null, maxDateString: string | null): string {
		var message = 'Pick a date';

		if (minDateString != null && maxDateString == null) {
			message += ` after ${minDateString}`;
		} else if (minDateString == null && maxDateString != null) {
			message += ` before ${maxDateString}`;
		} else if (minDateString != null && maxDateString != null) {
			message += ` between ${minDateString} and ${maxDateString}`;
		}

		return message;
	}
</script>

<div>
	<input
		class="form-control"
		bind:value={controller.valueAsString}
		required={controller.metadata.Required}
		type="date"
		min={minDateString}
		max={maxDateString}
		use:tooltip={getTooltipMessage(minDateString, maxDateString)}
	/>
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	div {
		display: flex;
		align-items: center;
	}

	input.form-control {
		min-height: $app-input-min-height;
	}
</style>
