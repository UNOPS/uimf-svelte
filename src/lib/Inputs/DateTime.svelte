<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface DateMetadata extends ComponentMetadata {
		DefaultValue: any;
	}

	export class Controller extends InputController<Date, DateMetadata> {
		public valueAsString: string | null = null;
		public defaultDate: Date = this.parseDate(this.metadata.DefaultValue);
		public initialised: Boolean | null = null;

		public getValue(): Promise<Date | null> {
			// if (this.value == null) {
			// 	return Promise.resolve(null);
			// }

			var utc = this.convertToUtc(this.value);

			return Promise.resolve(utc);
		}

		protected setValueInternal(value: Date | null): Promise<void> {
			if (value != null) {
				this.value = this.value;
			}

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

		public parseDate(value: any) {
			if (value == null) {
				return null;
			}

			if (value.indexOf('Date') !== -1) {
				return eval(value);
			}

			var asInt = Date.parse(value);
			return new Date(asInt);
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
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '../Infrastructure/uimf';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
			controller.initialised = false;
		},
		refresh() {
			console.log('controller.defaultDate', controller.defaultDate);
			if (!controller.initialised && controller.defaultDate != null) {
				//controller.setValue(controller.defaultDate);
				controller.initialised = true;
			}

			controller.valueAsString = controller.valueAsString;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div style="display: flex; align-items: center;">
	<input
		class="form-control"
		bind:value={controller.valueAsString}
		on:blur={() => controller.setValue(controller.valueAsString)}
		required={controller.metadata.Required}
		type="date"
	/>
	<span
		class="validity"
		style="display: {controller.valueAsString == null ||
		isNaN(new Date(controller.valueAsString).getTime()) ||
		new Date(controller.valueAsString) < new Date('01/01/1970')
			? 'none'
			: 'inline-block'};"
	/>
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
	}

	input:valid + span::after {
		content: '✓';
		margin-left: 10px;
		margin-top: 3px;
		color: green;
	}
</style>
