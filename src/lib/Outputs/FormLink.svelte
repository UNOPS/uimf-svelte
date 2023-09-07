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
	}

	export interface FormLinkMetadata extends ComponentMetadata {
		disabled: boolean;
	}

	export class Controller extends OutputController<FormLinkData> {
		public declare metadata: FormLinkMetadata;
	}
</script>

<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import Dialog, { openFormModal } from '../Components/Dialog.svelte';
	import { FormController } from '../Infrastructure/FormController';

	export let controller: Controller;
	let allowed: boolean;
	let url: string;

	let showModal = false;
	let confirmationMessageCallback: () => any;

	onMount(async () => {
		if (controller.value == null || controller.app == null) {
			return;
		}
		allowed = controller.app.hasRole(controller.value.RequiredPermission);
		url = await controller.app.makeUrl(controller.value);
	});

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
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
		console.log("open modal");
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
					if (controller.form != null) {
						controller.form.submit(true);
					}
				}
			);

		return Promise.resolve();
	};

	const downloadPdf = (): Promise<void> => {
		controller.app.getApi(controller.value.Form).then(function (result: any) {
			switch (controller.value.DocumentType) {
				case 'purchase-order':
					controller.app.pdfMake
						.createPdf(controller.app.pdfFactory.purchaseOrder(result))
						.download(controller.value.Filename);
					break;
				case 'proforma-invoice':
					controller.app.pdfMake
						.createPdf(controller.app.pdfFactory.pfi(result))
						.download(controller.value.Filename);
					break;
				case 'quotation':
					controller.app.pdfMake
						.createPdf(controller.app.pdfFactory.quotation(result))
						.download(controller.value.Filename);
					break;
				case 'final-invoice':
					var filename =
						'UN Web Buy Plus FinalInvoice - ' + result.Id + ' - ' + result.CaseNumber + '.pdf';
					controller.app.pdfMake
						.createPdf(controller.app.pdfFactory.pfi(result, 'FINAL INVOICE'))
						.download(filename);
					break;
				case 'quotation-final-invoices':
					result.forEach(function (invoice: { Id: string; CaseNumber: string }) {
						var filename =
							'UN Web Buy Plus FinalInvoice - ' + invoice.Id + ' - ' + invoice.CaseNumber + '.pdf';
						controller.app.pdfMake
							.createPdf(controller.app.pdfFactory.pfi(invoice, 'FINAL INVOICE'))
							.download(filename);
					});
					break;
				default:
					throw 'Unsupported document type: ' + controller.value.DocumentType + '.';
			}
		});
		return Promise.resolve();
	};

	const exportToExcel = (): Promise<Response> => {
		let urlQuery = encodeURIComponent(JSON.stringify(controller.value.InputFieldValues || {}));

		let url =
			'/api/form/' +
			controller.value.Form +
			'/' +
			controller.value.Field +
			'/exportToExcel?request=' +
			urlQuery;

		return controller.app.getApiFile(url);
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
				if (response.Metadata != null) {
					let customHandler = controller.app.formTools.responseHandlers[response.Metadata.Handler];
					if (customHandler != null) {
						customHandler(response);
					}
				}

				let functionsToRun = (response.Metadata || {}).FunctionsToRun || [];

				functionsToRun.forEach(function (f: { Id: string }) {
					var fn = controller.app.formTools.clientFunctions[f.Id];

					if (fn == null) {
						throw 'Cannot find client function "' + f.Id + '".';
					}

					fn({
						functionToRun: f,
						response: response,
						parentForm: controller.form
					});
				});

				if (controller.form != null) {
					controller.form.submit(true, controller.value.PostWithInputFieldValues ? controller.value.InputFieldValues : null);
				}

				return Promise.resolve();
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
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}{controller.value.Label}
		{:else}
			<a href={url} target={controller.value.Target}
				>{#if controller.value.Icon}
					<i class={controller.value.Icon} aria-hidden="true" />
				{/if}
				{controller.value.Label}</a
			>
		{/if}
	{:else if controller.value.Action === 'download-pdf' && allowed}
		<button
			type="button"
			class="btn btn-primary btn-lg"
			on:click={() => {
				downloadPdf();
			}}
			disabled={controller.metadata.disabled}
		>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{controller.value.Label}
		</button>
	{:else if controller.value.Action === 'excel-export' && allowed}
		<button
			type="button"
			class="btn btn-primary btn-lg"
			on:click={() => {
				exportToExcel();
			}}
			disabled={controller.metadata.disabled}
		>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{controller.value.Label}
		</button>
	{:else if controller.value.Action === 'open-modal' && allowed}
		<button
			type="button"
			class="btn btn-primary btn-lg"
			disabled={controller.metadata.disabled}
			on:click={() => {
				proceed(openModal);
			}}
		>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{controller.value.Label}
		</button>
	{:else if controller.value.Action === 'run' && allowed}
		<button
			type="button"
			class="btn btn-primary btn-lg"
			on:click={() => {
				proceed(run);
			}}
			disabled={controller.metadata.disabled}
		>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{controller.value.Label}
		</button>
	{:else if controller.value.Action === 'open-html-modal' && allowed}
		<button
			type="button"
			class="btn btn-primary btn-lg"
			disabled={controller.metadata.disabled}
			on:click={() => {
				openHtmlModal();
			}}
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
</style>
