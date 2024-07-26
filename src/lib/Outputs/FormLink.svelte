<script lang="ts" context="module">
	import { OutputController } from '../Infrastructure/OutputController';
	export interface FormLinkData {
		Icon?: string;
		Label?: string;
		Target?: string | null;
		ConfirmationMessage?: string;
		InputFieldValues?: any;
		Action?: any;
		RequiredPermission?: string;
		Form: string;
		Field?: string;
		Resolve?: any;
		StateParams?: any;
		TemplateUrl?: string;
		Controller?: any;
		DocumentType?: string;
		Filename?: string;
		CssClass?: string;
		Tooltip?: string;
		RenderTargets?: { [key: string]: string };
	}

	export class Controller extends OutputController<FormLinkData> {}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: Controller;
	export let disabled: boolean = false;

	let allowed: boolean;
	let cssClass: string;

	let component = new OutputComponent({
		async refresh() {
			controller.value = controller.value;

			if (controller.value == null) {
				return;
			}

			allowed = controller.app.hasPermission(controller.value.RequiredPermission);
			cssClass = controller.value.CssClass ?? controller.metadata?.CustomProperties?.cssClass;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function confirmAndRun(callback: () => void) {
		if (controller.value.ConfirmationMessage != null) {
			controller.app
				.confirm({
					bodyText: controller.value.ConfirmationMessage
				})
				.then(callback);
		} else {
			callback();
		}
	}

	function base64ToBytes(base64: string) {
		const binString = atob(base64);
		return Uint8Array.from(binString, (m) => m.codePointAt(0));
	}
</script>

{#if controller.value != null}
	{#if [null, 'redirect', 'redirect-to-url', 'void'].includes(controller.value.Action)}
		{#if !allowed || controller.value.Action === 'void'}
			<span class={cssClass} use:tooltip={controller.value.Tooltip}>
				{#if controller.value.Icon}
					<i
						class={controller.value.Icon}
						aria-hidden="true"
						class:icon-right-margin={(controller.value.Label?.length ?? 0) > 0}
					/>
				{/if}
				{#if controller.value.Label != null}
					{controller.value.Label}
				{/if}
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
					{#if controller.value.Label != null}
						{controller.value.Label}
					{/if}
				</a>
			{/await}
		{/if}
	{:else if allowed}
		<button
			type="button"
			class={cssClass ?? 'btn btn-default'}
			{disabled}
			use:tooltip={controller.value.Tooltip}
			on:click={() => {
				switch (controller.value.Action) {
					case 'download': {
						return controller.app
							.postForm(controller.value.Form, controller.value.InputFieldValues, {
								skipClientFunctions: true
							})
							.then(function (response) {
								const file = response.FileData;

								if (file == null) {
									throw new Error('File data is missing in the response.');
								}

								// The actual download
								const blob = new Blob([base64ToBytes(file.Data)], { type: file.ContentType });
								const link = document.createElement('a');
								link.href = window.URL.createObjectURL(blob);
								link.download = file.Filename;

								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
							});
					}

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
						confirmAndRun(() => {
							const originalUrl = window.location.href;

							return controller.app
								.openModal({
									form: controller.value.Form,
									inputFieldValues: controller.value.InputFieldValues,
									parentForm: controller.form,
									closeOnResponseHandled: false,
									init: function (form, modal) {
										// If the form inside the modal is posted successfully
										// then close the modal.
										form.on('form:responseHandled', function (event) {
											if (form.metadata.CloseOnPostIfModal && !event.postOnLoad) {
												modal.$close();
											}
										});

										// If the form's "exception actions" is posted successfully
										// then close the modal. We consider "exception actions" to
										// be an extension of the form, therefore posting an "exception
										// action", just like posting the form itself should close the modal.
										form.on('form:exceptionHandled', function () {
											if (form.metadata.CloseOnPostIfModal) {
												modal.$close();
											}
										});
									}
								})
								.then(async function () {
									if (controller.form != null && location.href === originalUrl) {
										// If parent form is a "record", meaning that initially it's called with
										// "operation=get" and the subsequent calls are done with "operation=post".
										if (
											controller.form.metadata.PostOnLoadValidation === false &&
											controller.form.inputs['Operation']
										) {
											// Mimic the initial "get" call, so that we reload the parent form.
											await controller.form.inputs['Operation'].setValue(null);
											controller.form.submit(true);
										} else {
											// For regular "non-record" forms we just re-submit the form normally.
											controller.form.submit(false);
										}
									}
								});
						});
						break;
					case 'run':
						confirmAndRun(() => {
							return controller.app
								.postForm(controller.value.Form, controller.value.InputFieldValues, {
									skipClientFunctions: true
								})
								.then(function (response) {
									if (response != null) {
										const renderTarget = controller.value.RenderTargets;

										if (controller.form != null && renderTarget != null) {
											for (const [sourceField, targetField] of Object.entries(renderTarget)) {
												const newValue = response[sourceField];
												const output = controller.form.response[targetField];

												if (output != null && output.setValue != null) {
													output.setValue(newValue);
												}
											}
										}

										controller.app.runResponseHandler(response);
										controller.app.runClientFunctions(response);

										if (renderTarget == null) {
											controller.form?.submit(false);
										}
									}
								});
						});

						break;
					case 'open-html-modal':
						confirmAndRun(() => {
							let resolve = JSON.parse(controller.value.Resolve) || {};
							resolve.$stateParams = JSON.parse(controller.value.StateParams) || {};

							if (controller.value.TemplateUrl == null) {
								throw new Error('TemplateUrl is not defined.');
							}

							return controller.app
								.openHtmlModal({
									templateUrl: controller.value.TemplateUrl,
									controller: controller.value.Controller,
									data: resolve
								})
								.then(function () {
									controller.form?.submit(true);
								});
						});

						break;
					default:
						controller.app.handleCustomFormLinkAction(controller.value);
						break;
				}
			}}
		>
			{#if controller.value.Icon}
				<i
					class={controller.value.Icon}
					aria-hidden="true"
					class:icon-right-margin={(controller.value.Label?.length ?? 0) > 0}
				/>
			{/if}
			{#if controller.value.Label != null}
				{controller.value.Label}
			{/if}
		</button>
	{/if}
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

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
		color: $link-color;
	}

	.btn-default {
		background-color: #fafafa;
		border-color: $app-btn-border-color;
		color: $link-color;

		&:focus-visible {
			border-color: $app-btn-border-color;
		}
	}

	.btn {
		border-radius: 0;
		font-size: 1em;
		text-decoration: none;

		&:hover {
			border-color: $app-btn-border-color;
		}
	}

	i.icon-right-margin {
		margin: 0 5px 0 0;
	}
</style>
