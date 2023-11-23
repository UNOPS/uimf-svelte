<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	export class Controller extends InputController<string> {
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

{#if controller.metadata.CustomProperties?.multiline}
	<textarea
		class="form-control"
		bind:value={controller.value}
		required={controller.metadata.Required}
	/>
{:else}
	<input
		autocomplete="off"
		class="form-control"
		on:change={() => controller.setValue(controller.value)}
		bind:value={controller.value}
		required={controller.metadata.Required}
		type="text"
	/>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
	}
</style>
