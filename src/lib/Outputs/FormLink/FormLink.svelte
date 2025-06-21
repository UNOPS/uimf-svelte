<script lang="ts" context="module">
	export type { IFormLinkData } from './IFormLinkData';
	export { DynamicValueSource } from './IDynamicInputValue';
	export type { IDynamicInputValue } from './IDynamicInputValue';
	export type { IFormlinkView } from './IFormlinkView';
	export { FormlinkController as Controller } from './FormLinkController';
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';
	import type { FormlinkController } from './FormLinkController';
	import { DynamicValueSource } from './IDynamicInputValue';

	export let controller: FormlinkController;
	export let disabled: boolean = false;

	let allowed: boolean;
	let cssClass: string | null = null;

	let useAlternativeView = false;
	let unsubscribe: (() => void) | null = null;

	// Create reactive variables for both normal and alternative views
	$: currentLabel = useAlternativeView
		? controller.value?.AlternativeView?.Label ?? null
		: controller.value?.Label ?? null;

	$: currentIcon = useAlternativeView
		? controller.value?.AlternativeView?.Icon
		: controller.value?.Icon;

	$: currentCssClass = useAlternativeView
		? controller.value?.AlternativeView?.CssClass
		: controller.value?.CssClass;

	let component = new OutputComponent({
		async init() {
			const alternativeView = controller.value?.AlternativeView;

			if (alternativeView != null) {
				if (unsubscribe != null) {
					unsubscribe();
				}

				unsubscribe = controller.app.appStorage.on('change', () => {
					useAlternativeView = controller.app.appStorage.isToggled(alternativeView.RequiredValue);
				});

				useAlternativeView = controller.app.appStorage.isToggled(alternativeView.RequiredValue);
			}
		},
		async refresh() {
			useAlternativeView =
				controller.value?.AlternativeView != null &&
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

	/**
	 * Gets the input values taking into account `IFormLinkData.InputFieldValues` and `IFormLinkData.DynamicInputValues`.
	 * @param controller - The controller for the form link.
	 * @returns The input values with which the form link should be submitted.
	 */
	async function getInputValues(controller: FormlinkController) {
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

	function updateTargetFields(
		targets: Record<string, string> | null,
		source: any,
		targetContainer: any
	) {
		if (targets != null) {
			for (const [sourceField, targetField] of Object.entries(targets)) {
				const target = targetContainer[targetField];
				if (target != null && target.setValue != null) {
					const newValue = source[sourceField];
					target.setValue(newValue);
				}
			}
		}
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
			{#await getInputValues(controller) then inputs}
				{#await controller.app.makeUrl( { Form: controller.value.Form, InputFieldValues: inputs, Action: controller.value.Action } ) then url}
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
			on:click={async () => {
				if (controller.value.ToggledVariable != null) {
					controller.app.appStorage.toggleVariable(controller.value.ToggledVariable);
				}

				const inputs = await getInputValues(controller);

				switch (controller.value.Action) {
					case 'download': {
						return controller.app
							.postForm(controller.value.Form, inputs, {
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
							let urlQuery = encodeURIComponent(JSON.stringify(inputs));

							let url = `/api/form/${controller.value.Form}/${controller.value.Field}/exportToExcel?request=${urlQuery}`;
							controller.app.getApiFile(url);
						}
						break;
					case 'update-section':
						{
							if (!controller.value.Target) {
								throw new Error('Target is missing.');
							}

							controller.app.showFormInSection(
								controller.value.Form,
								inputs,
								controller.value.Target
							);
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
							return controller.app
								.postForm(controller.value.Form, inputs, {
									skipClientFunctions: true
								})
								.then(function (response) {
									if (response != null) {
										controller.app
											.runResponseHandler(response)
											.then(() => controller.app.runClientFunctions(response, controller.form))
											.then(() => {
												const targetOutputs = controller.value.RenderOutputTargets ?? null;
												const targetInputs = controller.value.RenderInputTargets ?? null;

												if (controller.form != null) {
													updateTargetFields(targetOutputs, response, controller.form.response);
													updateTargetFields(targetInputs, response, controller.form.inputs);
												}

												if (targetInputs == null && targetOutputs == null) {
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
	@import '../../scss/styles.variables.scss';

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
