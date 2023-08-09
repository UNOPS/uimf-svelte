<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export interface DateRange {
		Min: Date;
		Max: Date;
	}

	export class Controller extends InputController<DateRange> {
		public valuesAsString: string | null = null;
		public minValueAsString: string | null = null;
		public maxValueAsString: string | null = null;

		public getValue(): Promise<DateRange | null> {
			if (this.value == null) {
				return Promise.resolve(null);
			}

			var result = {
				Min: this.convertToUtc(this.value.Min),
				Max: this.convertToUtc(this.value.Max)
			} as DateRange;

			return Promise.resolve(result);
		}

		protected setValueInternal(value: DateRange | null): Promise<void> {
			if (value != null) {
				this.minValueAsString = this.serializeDate(value.Min);
				this.maxValueAsString = this.serializeDate(value.Max);
			}

			this.valuesAsString = this.serialize(value);
			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<DateRange | null> {
			if (value == null || value.trim().length == 0) {
				return Promise.resolve(null);
			}

			let parts = value.split(',');

			var result = {
				Min: this.convertToUtc(new Date(parts[0])),
				Max: this.convertToUtc(new Date(parts[1]))
			} as DateRange;

			return Promise.resolve(result);
		}

		serializeDate(value: Date): string {
			return (
				value.getFullYear() +
				'-' +
				(value.getMonth() + 1).toString().padStart(2, '0') +
				'-' +
				value.getDate().toString().padStart(2, '0')
			);
		}

		public serialize(value: DateRange | null): string | null {
			if (value == null || value.Min == null || value.Max == null) {
				return null;
			}

			if (typeof value.Min == 'string') {
				return value.Min + ',' + value.Max;
			}

			return (
				this.serializeDate(value.Min) +
				',' +
				this.serializeDate(value.Max)
			);
		}

		public combineDates(): void {
			this.valuesAsString = this.minValueAsString + ',' + this.maxValueAsString;
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
	import { InputComponentController } from '../Infrastructure/ComponentController';

	export let controller: Controller;

	let component = new InputComponentController({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.valuesAsString = controller.valuesAsString;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class="date-range">
	<input
		class="form-control"
		bind:value={controller.minValueAsString}
		on:change={() => {
			controller.combineDates();
			controller.setValue(controller.valuesAsString);
		}}
		required={controller.metadata.Required}
		type="date"
	/>

	<input
		class="form-control"
		bind:value={controller.maxValueAsString}
		on:change={() => {
			controller.combineDates();
			controller.setValue(controller.valuesAsString);
		}}
		required={controller.metadata.Required}
		type="date"
	/>
</div>

<style lang="scss">
	@import '../../scss/styles.scss';

	.date-range {
		display: flex;
		gap: 10px;
	}
</style>
