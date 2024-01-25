<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export class Controller extends InputController<Date> {
		public valueAsString: string | null = null;

		public getValue(): Promise<Date | null> {
			if (this.value == null) {
				return Promise.resolve(null);
			}

			var utc = this.convertToUtc(this.value);
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

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
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
