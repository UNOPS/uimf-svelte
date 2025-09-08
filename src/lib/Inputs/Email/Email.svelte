<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	interface Configuration {
		Placeholder: string;
		Multiple: boolean;
	}

	interface Email {
		Value?: string;
	}

	export class Controller extends InputController<Email, IInputFieldMetadata<Configuration>> {
		public valueAsString: string | null = null;

		public getValue(): Promise<Email | null> {
			const effective = this.valueAsString ?? '';

			if (effective?.length > 0) {
				return Promise.resolve({ Value: effective });
			}

			return Promise.resolve(null);
		}

		public deserialize(value: string | null): Promise<Email | null> {
			const effective = value?.trim() ?? '';

			if (effective.length > 0) {
				return Promise.resolve({ Value: effective });
			}

			return Promise.resolve(null);
		}

		public serialize(value: Email | string | null): string | null {
			if (typeof value === 'string') {
				return value?.trim() ?? null;
			}

			return value?.Value?.trim() ?? null;
		}

		protected override setValueInternal(value: Email | null): Promise<void> {
			this.valueAsString = value?.Value?.trim() ?? '';

			if (this.valueAsString.length > 0) {
				this.value = { Value: this.valueAsString };
			} else {
				this.value = null;
			}

			return Promise.resolve();
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IInputFieldMetadata } from '$lib/Infrastructure/Metadata';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
			controller.valueAsString = controller.valueAsString;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<input
	autocomplete="off"
	class="form-control"
	on:change={() => controller.setValue(controller.valueAsString)}
	bind:value={controller.valueAsString}
	required={controller.metadata.Required}
	placeholder={controller.metadata.Component.Configuration?.Placeholder}
	type="email"
	multiple={controller.metadata.Component.Configuration?.Multiple}
/>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
	}
</style>
