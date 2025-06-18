<script lang="ts" context="module">
	import { OutputController } from '../Infrastructure/OutputController';
	export interface FormLinkData {
		AlternativeView?: IFormlinkView;
		ToggledVariable?: IFrontendVariableValue;
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
		DynamicInputValues?: { [key: string]: IDynamicInputValue };

		// Html modal options.
		StateParams?: any;
		TemplateUrl?: string;
		Resolve?: any;
		Size?: string;
		WindowClass?: string;
	}

	interface IDynamicInputValue {
		Name: string;
		Source: DynamicValueSource;
	}

	enum DynamicValueSource {
		ParentForm = 'ParentForm',
		FrontendVariable = 'FrontendVariable'
	}

	interface IFormlinkView {
		CssClass?: string;
		Icon?: string;
		Label?: string;
		RequiredValue: IFrontendVariableValue;
	}

	export class Controller extends OutputController<FormLinkData> {}

	export function makeController(value: FormLinkData, parent: OutputController<any, any>) {
		return new OutputController<FormLinkData>({
			metadata: {} as IOutputFieldMetadata,
			data: value,
			form: parent.form!,
			app: parent.app,
			parent: parent
		}) as Controller;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';
	import { IFrontendVariableValue } from '../Infrastructure/AppStorage';

	export let controller: Controller;
	export let disabled: boolean = false;

	let allowed: boolean;
	let cssClass: string | null = null;

	let useAlternativeView = false;
	let unsubscribe: (() => void) | null = null;

	// Create reactive variables for both normal and alternative views
	$: currentIcon = useAlternativeView
		? controller.value?.AlternativeView?.Icon
		: controller.value?.Icon;

	$: currentLabel = useAlternativeView
		? controller.value?.AlternativeView?.Label
		: controller.value?.Label;

	$: currentCssClass = useAlternativeView
		? controller.value?.AlternativeView?.CssClass
		: controller.value?.CssClass;

	let component = new OutputComponent({
		async init() {
			const alternativeView = controller.value.AlternativeView;

			if (alternativeView != null) {
				if (unsubscribe != null) {
					unsubscribe();
				}

				unsubscribe = controller.app.appStorage.on('change', () => {
					useAlternativeView = !!controller.app.appStorage.isToggled(alternativeView.RequiredValue);
				});

				useAlternativeView = !!controller.app.appStorage.isToggled(alternativeView.RequiredValue);
			}
		},
		async refresh() {
			useAlternativeView =
				controller.value.AlternativeView != null &&
				controller.app.appStorage.isToggled(controller.value.AlternativeView.RequiredValue);

			controller.value = controller.value;

			if (controller.value == null) {
				return;
			}

			allowed = controller.app.hasPermission(controller.value.RequiredPermission);
			cssClass = currentCssClass ?? controller.metadata?.CssClass ?? null;
		},
		destroy() {
			if (unsubscribe != null) {
				unsubscribe();
			}
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

	async function getInputValues(controller: Controller) {
		const dynamicInputValues = controller.value.DynamicInputValues;

		const result = controller.value.InputFieldValues || {};

		if (controller.form != null && dynamicInputValues != null) {
			let parentFormValues = null;

			for (const [targetField, dynamicValue] of Object.entries(dynamicInputValues)) {
				switch (dynamicValue.Source) {
					case DynamicValueSource.ParentForm: {
						parentFormValues = parentFormValues ?? (await controller.form.getInputFieldValues());
						result[targetField] = await parentFormValues[dynamicValue.Name];
					}
					case DynamicValueSource.FrontendVariable: {
						result[targetField] = controller.app.appStorage.get(dynamicValue.Name);
					}
				}
			}
		}

		return result;
	}
</script>

{#if controller.value != null}
	{#if [null, 'redirect', 'redirect-to-url', 'void'].includes(controller.value.Action)}
		{#if !allowed || controller.value.Action === 'void'}
			<span class={cssClass} use:tooltip={controller.value.Tooltip}>
				{#if currentIcon}
					<i
						class={currentIcon}
						aria-hidden="true"
						class:margin-right={(currentLabel?.length ?? 0) > 0}
					/>
				{/if}
				{#if currentLabel != null}
					{currentLabel}
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
					{#if currentIcon}
						<i class={currentIcon} aria-hidden="true" />
					{/if}
					{#if currentLabel != null}
						{currentLabel}
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
			use:tooltip={(controller.value.Tooltip || '') + deadlineTooltip}
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
					case 'update-section':
						{
							if (!controller.value.Target) {
								throw new Error('Target is missing.');
							}

							let sectionId = controller.value.Target;

							if (controller.value.ToggledVariable != null) {
								controller.app.appStorage.toggleVariable(controller.value.ToggledVariable);
							}

							return getInputValues(controller).then((inputFields) => {
								controller.app.showFormInSection(controller.value.Form, inputFields, sectionId);
							});
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

										form.on('form:close', function () {
											modal.$close();
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
							const inputFieldValues = await getInputValues(controller);

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

										controller.app
											.runResponseHandler(response)
											.then(() => controller.app.runClientFunctions(response, controller.form))
											.then(() => {
												if (renderInputTarget == null && renderOutputTarget == null) {
													controller.form?.submit(false);
												}
											});
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
			{#if currentIcon}
				<i
					class={currentIcon}
					aria-hidden="true"
					class:margin-right={(currentLabel?.length ?? 0) > 0}
				/>
			{/if}
			{#if currentLabel != null}
				{currentLabel}
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
