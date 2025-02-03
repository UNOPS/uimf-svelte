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
		Field?: string | null;
		Controller?: any;
		DocumentType?: string;
		Filename?: string;
		CssClass?: string;
		Tooltip?: string;
		Deadline?: string;
		RenderInputTargets?: { [key: string]: string };
		RenderOutputTargets?: { [key: string]: string };
		ForwardedInputValues?: { [key: string]: string };

		// Html modal options.
		StateParams?: any;
		TemplateUrl?: string;
		Resolve?: any;
		Size?: string;
		WindowClass?: string;
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
		const bytes = new Uint8Array(binString.length);
		for (let i = 0; i < binString.length; i++) {
			bytes[i] = binString.charCodeAt(i);
		}
		return bytes;
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
						class:margin-right={(controller.value.Label?.length ?? 0) > 0}
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
		{@const deadline =
			controller.value.Deadline != null ? new Date(controller.value.Deadline) : null}
		{@const now = new Date()}
		{@const deadlineTooltip =
			deadline != null
				? `<br><br>This action ${
						now < deadline ? 'will be' : 'was'
				  } available only until ${deadline.toLocaleString()}.`
				: ''}
		<button
			type="button"
			class={cssClass ?? 'btn btn-default'}
			{disabled}
			use:tooltip={controller.value.Tooltip + deadlineTooltip}
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
						confirmAndRun(async () => {
							const forwardedInputValues = controller.value.ForwardedInputValues;

							const inputFieldValues = controller.value.InputFieldValues || {};

							if (controller.form != null && forwardedInputValues != null) {
								const parentFormValues = await controller.form.getInputFieldValues();

								for (const [targetField, sourceField] of Object.entries(forwardedInputValues)) {
									const forwardedValue = await parentFormValues[sourceField];
									inputFieldValues[targetField] = forwardedValue;
								}
							}

							return controller.app
								.postForm(controller.value.Form, inputFieldValues, {
									skipClientFunctions: true
								})
								.then(function (response) {
									if (response != null) {
										const renderOutputTarget = controller.value.RenderOutputTargets;
										const renderInputTarget = controller.value.RenderInputTargets;

										if (controller.form != null) {
											if (renderOutputTarget != null)
												for (const [sourceField, targetField] of Object.entries(
													renderOutputTarget
												)) {
													const newValue = response[sourceField];

													const output = controller.form.response[targetField];
													if (output != null && output.setValue != null) {
														output.setValue(newValue);
													}
												}

											if (renderInputTarget != null)
												for (const [sourceField, targetField] of Object.entries(
													renderInputTarget
												)) {
													const newValue = response[sourceField];

													const input = controller.form.inputs[targetField];
													if (input != null && input.setValue != null) {
														input.setValue(newValue);
													}
												}
										}

										controller.app.runResponseHandler(response);
										controller.app.runClientFunctions(response);

										if (renderInputTarget == null && renderOutputTarget == null) {
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
									data: resolve,
									size: controller.value.Size,
									windowClass: controller.value.WindowClass
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
					class:margin-right={(controller.value.Label?.length ?? 0) > 0}
				/>
			{/if}
			{#if controller.value.Label != null}
				{controller.value.Label}
			{/if}
			{#if deadline != null && now < deadline}
				<span class="deadline" />
			{/if}
		</button>
	{/if}
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.btn {
		border-radius: 0;
		font-size: 1em;
		text-decoration: none;
		border-width: 1px;
		border-style: solid;

		&[disabled] {
			background-color: #fff;
			border-color: #ccc;
			color: #959595;
		}

		&:hover {
			border-color: $app-btn-border-color;
		}

		&.btn-primary {
			color: white;

			&:hover {
				color: white;
			}
		}

		&.btn-default {
			background-color: #fafafa;
			border-color: $app-btn-border-color;
			color: $link-color;

			&:focus-visible {
				border-color: $app-btn-border-color;
			}
		}
	}

	// Handle ".btn-link" is not the same as ".btn.btn-link".
	.btn-link {
		margin: 0 !important;
		padding: 0 !important;
		border-width: 0;
		color: $link-color;
		text-align: left;
		background-color: transparent;
		text-decoration: none;
		text-decoration: underline;

		&:hover {
			color: $link-hover-color;
			text-decoration: underline;
			background-color: transparent;
		}
	}

	:global(td):has(> .btn) {
		padding: 3px !important;

		// Make the column as narrow as possible.
		width: 1px;

		> .btn {
			padding-top: 5px;
			padding-bottom: 5px;
			font-size: 0.9em;
		}
	}

	i.margin-right {
		margin: 0 5px 0 0;
	}

	.no-decoration {
		background: none;
		text-decoration: none;
		border: none;
	}

	button {
		position: relative;
	}

	.deadline {
		background: red;
		border-radius: 50%;
		width: 6px;
		height: 6px;
		position: absolute;
		top: 0px;
		right: 0px;
	}
</style>
