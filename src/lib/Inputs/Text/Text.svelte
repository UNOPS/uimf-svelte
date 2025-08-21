<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	interface Configuration {
		MinLength?: number;
		MaxLength?: number;
		Multiline: boolean;
		Password: boolean;
		Placeholder: string;
	}

	export class Controller extends InputController<string, IInputFieldMetadata<Configuration>> {
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
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IInputFieldMetadata } from '$lib/Infrastructure/Metadata';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.metadata.Component.Configuration?.Password === true}
	<input
		autocomplete="off"
		class="form-control"
		on:change={() => controller.setValue(controller.value)}
		bind:value={controller.value}
		required={controller.metadata.Required}
		minlength={controller.metadata.Component.Configuration?.MinLength}
		maxlength={controller.metadata.Component.Configuration?.MaxLength}
		placeholder={controller.metadata.Component.Configuration?.Placeholder}
		type="password"
	/>
{:else if controller.metadata.Component.Configuration?.Multiline === true}
	<textarea
		class="form-control"
		rows="4"
		bind:value={controller.value}
		required={controller.metadata.Required}
		minlength={controller.metadata.Component.Configuration?.MinLength}
		maxlength={controller.metadata.Component.Configuration?.MaxLength}
		placeholder={controller.metadata.Component.Configuration?.Placeholder}
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
		placeholder={controller.metadata.Component.Configuration?.Placeholder}
		type="text"
	/>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
		font-size: inherit;
	}

	textarea {
		min-height: 100px;
		min-width: 100%;
		max-width: 100%;
		font-size: inherit;
	}
</style>
