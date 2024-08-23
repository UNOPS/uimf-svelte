<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface Configuration {
		DefaultValue: boolean | null;
	}

	export class Controller extends InputController<boolean, IInputFieldMetadata<Configuration>> {
		public getValue(): Promise<boolean | null> {
			var result = this.deserialize(this.value?.toString() ?? null);
			return Promise.resolve(result);
		}

		public deserialize(value: string | null): Promise<boolean | null> {
			if (!this.metadata.Required && (value == null || value === '')) {
				return Promise.resolve(null);
			}

			var result = value == null ? false : value.toLowerCase() === 'true';

			return Promise.resolve(result);
		}

		public serialize(value: boolean | null): string | null {
			if (value == null) {
				return null;
			}

			if (this.metadata.Required === true) {
				return value ? 'true' : null;
			}

			return value ? 'true' : 'false';
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata, IInputFieldMetadata } from '$lib/Infrastructure/uimf';

	export let controller: Controller;

	let component = new InputComponent({
		async init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div>
	{#if controller.metadata.Required}
		<input
			class="form-check-input"
			type="checkbox"
			bind:checked={controller.value}
			on:change={() => controller.setValue(controller.value)}
		/>
	{:else}
		<select
			class="form-select"
			bind:value={controller.value}
			on:change={() => controller.setValue(controller.value)}
		>
			<option />
			<option value={true}>Yes</option>
			<option value={false}>No</option>
		</select>
	{/if}
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	div,
	.form-select {
		min-height: $app-input-min-height;
	}

	.form-check-input {
		margin: 9px 0 0 0;
		outline: none !important;
	}
</style>
