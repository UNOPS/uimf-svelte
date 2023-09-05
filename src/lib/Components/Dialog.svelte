<script context="module" lang="ts">
	import Dialog from './Dialog.svelte';
	import UimfForm from '../Form.svelte';

	export function openFormModal(
		node: HTMLElement,
		formController: FormController,
	) {
		const dialog = new Dialog({
			target: node,
			props: {
				title: formController.metadata.Label,
				component: UimfForm,
				controller: formController,
				onSubmit: async (v: any) => {
					dialog.$destroy();
					console.log("submit form: ", formController.parentForm?.title);
					await formController.parentForm?.submit(true);
				},
				onCancel: (v: any) => {
					dialog.$destroy();
				}
			}
		});
	}
</script>

<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type EventSource from '../Infrastructure/EventSource';
	import type { FormController } from '../Infrastructure/FormController';

	export let onCancel: (v: any) => any;
	export let onSubmit: (v: any) => any;
	export let title: string;
	export let component: ComponentType<SvelteComponent> | null = null;
	export let controller: EventSource | null = null;
	export let submitText = 'Submit';
	export let cancelText = 'Cancel';
</script>

<div class="modal-container">
	<div class="modal my-modal" tabindex="-1">
		<div class="modal-dialog modal-lg" style="width: 100%;">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{title}</h5>
					<button type="button" class="btn-close" aria-label="Close" on:click={onCancel} />
				</div>
				<div class="modal-body">
					{#if controller != null && component != null}
						<svelte:component this={component} {onSubmit} {onCancel} {controller} />
					{:else}
						<slot />
					{/if}
				</div>
				{#if controller == null || component == null}
					<div class="modal-footer">
						<button on:click={onCancel} type="button" class="btn btn-secondary">{cancelText}</button
						>
						<button on:click={onSubmit} type="button" class="btn btn-primary">{submitText}</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@import '../../scss/styles.scss';

	.modal-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.my-modal {
		margin-top: 15%;
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		width: 100%;
		height: 100%;
		font-size: 1.2em;
	}
</style>
