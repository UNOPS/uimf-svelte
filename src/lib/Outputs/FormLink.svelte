<script lang="ts" context="module">
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';
	import { OutputController } from '../Infrastructure/OutputController';
	export interface FormLinkData {
		Icon: string;
		Label: string;
		Target: string | null;
		ConfirmationMessage: string;
		InputFieldValues: any;
		Action: any;
		RequiredPermission: string;
		Form: string;
		Field: string;
		Resolve: any;
		StateParams: any;
		TemplateUrl: string;
		Controller: any;
		DocumentType: string;
		Filename: string;
		PostWithInputFieldValues: boolean;
		CssClass: string;
		Tooltip: string;
	}

	export interface FormLinkMetadata extends ComponentMetadata {
		disabled: boolean;
	}

	export class Controller extends OutputController<FormLinkData> {
		public declare metadata: FormLinkMetadata;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import Dialog, { openFormModal } from '../Components/Dialog.svelte';
	import { FormController } from '../Infrastructure/FormController';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: Controller;

	let allowed: boolean;
	let showModal = false;
	let confirmationMessageCallback: () => any;
	let cssClass: string;

	let component = new OutputComponentController({
		async refresh() {
			controller.value = controller.value;

			if (controller.value == null) {
				return;
			}

			allowed = controller.app.hasRole(controller.value.RequiredPermission);
			cssClass = controller.value.CssClass ?? controller.metadata?.CustomProperties?.cssClass;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const proceed = (callback: () => Promise<void>): Promise<void> => {
		if (controller.value == null) {
			return Promise.resolve();
		}
		var confirmationMessage = controller.value.ConfirmationMessage;

		if (confirmationMessage != null && showModal === false) {
			confirmationMessageCallback = callback;
			showModal = true;

			return Promise.resolve();
		} else {
			return callback();
		}
	};

	const openModal = (): Promise<void> => {
		controller.app.getForm(controller.value.Form).then(async (form) => {
			if (controller.value.InputFieldValues != null) {
				Object.keys(form.inputs).forEach((key) => {
					form.inputs[key].value = controller.value.InputFieldValues[key];
				});
			}

			let formController = new FormController(controller.form!, form);
			openFormModal(document.body, formController);
		});
		return Promise.resolve();
	};

	const openHtmlModal = (): Promise<void> => {
		let resolve = JSON.parse(controller.value.Resolve) || {};
		resolve.$stateParams = JSON.parse(controller.value.StateParams) || {};

		controller.app
			.uibOpenModal({
				templateUrl: controller.value.TemplateUrl,
				controller: controller.value.Controller,
				resolve: resolve,
				backdrop: 'static',
				size: 'lg'
			})
			.result.then(
				function () {},
				function () {
					controller.form?.submit(true);
				}
			);

		return Promise.resolve();
	};

	const run = (): Promise<void> => {
		if (controller.value == null) {
			return Promise.resolve();
		}

		return controller.app
			.postForm(controller.value.Form, controller.value.InputFieldValues, {
				skipClientFunctions: true
			})
			.then(function (response) {
				controller.app.runResponseHandler(response);
				controller.app.runClientFunctions(response);

				controller.form?.submit(
					true,
					controller.value.PostWithInputFieldValues ? controller.value.InputFieldValues : null
				);
			});
	};
</script>

{#if showModal}
	<Dialog
		title="Confirmation message"
		onCancel={() => {
			showModal = false;
		}}
		onSubmit={() => {
			showModal = false;
			confirmationMessageCallback?.();
		}}
	>
		<p>{controller.value.ConfirmationMessage}</p>
	</Dialog>
{/if}

{#if controller.value != null}
	{#if controller.value.Action == null || controller.value.Action === 'redirect' || controller.value.Action === 'redirect-to-url'}
		{#if !allowed}
			<span class={cssClass} use:tooltip={controller.value.Tooltip}>
				{#if controller.value.Icon}
					<i class={controller.value.Icon} aria-hidden="true" />
				{/if}
				{controller.value.Label}
			</span>
		{:else}
			{#await controller.app.makeUrl(controller.value) then url}
				<a
					href={url}
					target={controller.value.Target}
					class={cssClass}
					use:tooltip={controller.value.Tooltip}
				>
					{#if controller.value.Icon}
						<i class={controller.value.Icon} aria-hidden="true" />
					{/if}
					{controller.value.Label}</a
				>
			{/await}
		{/if}
	{:else if allowed}
		<button
			type="button"
			class={cssClass ?? 'btn btn-default'}
			use:tooltip={controller.value.Tooltip}
			on:click={() => {
				switch (controller.value.Action) {
					case 'excel-export':
						{
							let urlQuery = encodeURIComponent(
								JSON.stringify(controller.value.InputFieldValues || {})
							);

							let url = `/api/form/${controller.value.Form}/${controller.value.Field}/exportToExcel?request=${urlQuery}`;
							controller.app.getApiFile(url);
						}
						break;
					case 'open-modal':
						proceed(openModal);
						break;
					case 'run':
						proceed(run);
						break;
					case 'open-html-modal':
						openHtmlModal();
						break;
					default:
						controller.app.handleCustomFormLinkAction(controller.value);
				}
			}}
			disabled={controller.metadata.disabled}
		>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{controller.value.Label}
		</button>
	{/if}
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.btn-primary {
		color: white;
	}

	.btn-primary:hover {
		color: white;
	}

	.btn-link {
		margin: 0;
		padding: 0;
		border: none;
	}
</style>
