<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	export class Controller extends InputController<number, IFieldMetadata<NumberConfiguration>> {
		public getValue(): Promise<number | null> {
			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<number | null> {
			const result = value == null ? null : parseFloat(value);

			if (result == null || isNaN(result)) {
				return Promise.resolve(null);
			}

			return Promise.resolve(result);
		}

		public serialize(value: number | null): string | null {
			return value == null ? null : value.toString();
		}
	}

	interface NumberConfiguration {
		MinValue: number | null;
		MaxValue: number | null;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';

	export let controller: Controller;

	let multiplier: number = 1;

	let min: number | null;
	let max: number | null;

	let component = new InputComponent({
		init() {
			multiplier = Math.pow(10, controller.metadata.CustomProperties?.numberPrecision ?? 0);
			controller.ready?.resolve();
		},
		refresh() {
			min = controller.metadata.Component.Configuration?.MinValue;
			max = controller.metadata.Component.Configuration?.MaxValue;

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const limitPrecision = (v: number | null) => {
		if (v !== null && v !== 0) {
			return Math.trunc(v * multiplier) / multiplier;
		}
		return v;
	};
</script>

<input
	autocomplete="off"
	class="form-control"
	on:change={() => controller.setValue(limitPrecision(controller.value))}
	bind:value={controller.value}
	required={controller.metadata.Required}
	step={1 / multiplier}
	type="number"
	{min}
	{max}
/>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
	}
</style>
