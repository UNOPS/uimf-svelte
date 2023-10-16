<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface Password {
		Value?: string;
	}

	export class Controller extends InputController<Password> {
		public valueAsString: string | null = null;

		public getValue(): Promise<Password | null> {
			const effective = this.valueAsString ?? '';

			if (effective?.length > 0) {
				return Promise.resolve({ Value: effective });
			}

			return Promise.resolve(null);
		}

		public deserialize(value: string | null): Promise<Password | null> {
			const effective = value?.trim() ?? '';

			if (effective.length > 0) {
				return Promise.resolve({ Value: effective });
			}

			return Promise.resolve(null);
		}

		public serialize(value: Password | string | null): string | null {
			if (typeof value === 'string') {
				return value?.trim() ?? null;
			}

			return value?.Value?.trim() ?? null;
		}

		protected override setValueInternal(value: Password | null): Promise<void> {
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
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
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
	type="password"
/>

<style lang="scss">
	@import '../../scss/styles.scss';
</style>
