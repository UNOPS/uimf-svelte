<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface DateMetadata extends ComponentMetadata {
		CustomProperties: {
			[propertyName: string]: any;
			DefaultValue: string | null;
		};
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

		ToValidDateString(date: string | null): string | null {
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

		public static parseDefaultValue(value: string | null): Date | null {
			if (value == null) {
				return null;
			}

			if (value == 'new Date()') {
				return new Date();
			}

			var asInt = Date.parse(value);
			return new Date(asInt);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: Controller;

	let initialised = false;
	let defaultValue: Date | null;

	let minDate: string | null;
	let maxDate: string | null;

	let minDateString: string | null;
	let maxDateString: string | null;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();

			defaultValue = Controller.parseDefaultValue(
				controller.metadata.CustomProperties?.DefaultValue
			);
		},
		refresh() {
			if (!initialised && defaultValue != null) {
				controller.setValue(defaultValue);
				initialised = true;
			}

			const minDateField = controller.metadata.CustomProperties?.MinDateValue;
			const maxDateField = controller.metadata.CustomProperties?.MaxDateValue;

			minDate = minDateField != null ? controller.form?.response[minDateField]?.value : null;
			maxDate = maxDateField != null ? controller.form?.response[maxDateField]?.value : null;

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
