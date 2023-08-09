<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	export class Controller extends InputController<boolean> {
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
	import { InputComponentController } from '../Infrastructure/ComponentController';

	export let controller: Controller;

	let component = new InputComponentController({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.metadata.Required}
	<input class="form-check-input" type="checkbox" bind:checked={controller.value} />
{:else}
	<select class="form-control form-control-lg" bind:value={controller.value}>
		<option />
		<option value={true}>Yes</option>
		<option value={false}>No</option>
	</select>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.form-check-input {
		margin: 9px 0 0 0;
	}
</style>
