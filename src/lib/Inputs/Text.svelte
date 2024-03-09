<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface Configuration {
		MinLength?: number;
		MaxLength?: number;
		Multiline: boolean;
	}

	export class Controller extends InputController<string, IFieldMetadata<Configuration>> {
		public getValue(): Promise<string | null> {
			return Promise.resolve(this.value != null && this.value.length > 0 ? this.value : null);
		}
		public deserialize(value: string | null): Promise<string | null> {
			return Promise.resolve(value);
		}
		public serialize(value: string | null): string | null {
			return value;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.metadata.Component.Configuration?.Multiline === true}
	<textarea
		class="form-control"
		bind:value={controller.value}
		required={controller.metadata.Required}
		minlength={controller.metadata.Component.Configuration?.MinLength}
		maxlength={controller.metadata.Component.Configuration?.MaxLength}
	/>
{:else}
	<input
		autocomplete="off"
		class="form-control"
		on:change={() => controller.setValue(controller.value)}
		bind:value={controller.value}
		required={controller.metadata.Required}
		minlength={controller.metadata.Component.Configuration?.MinLength}
		maxlength={controller.metadata.Component.Configuration?.MaxLength}
		type="text"
	/>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
	}
</style>
