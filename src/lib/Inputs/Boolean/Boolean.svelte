<script lang="ts" context="module">
	export { BooleanController as Controller } from './BooleanController';
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { BooleanController } from './BooleanController';

	export let controller: BooleanController;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div>
	{#if controller.metadata.Required}
		<input
			class="form-check-input border border-dark-subtle"
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
	@import '../../scss/styles.variables.scss';

	div,
	.form-select {
		min-height: $app-input-min-height;
	}

	.form-check-input {
		margin: 9px 0 0 0;
		outline: none !important;
	}
</style>
