<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import type { InputController } from '../../Infrastructure/InputController';
	import Input from '../../Input.svelte';
	import { defaultControlRegister } from '../../Infrastructure/ControlRegister';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import type { IFormLinkData } from '../FormLink/FormLink.svelte';
	import FormLinkComponent from '../FormLink/FormLink.svelte';
	import { FormlinkUtilities } from '../FormLink/FormlinkUtilities';
	import { withButtonLoading, onAsyncClick } from '../../Components/OnAsyncClick.svelte';

	interface IData {
		Actions: IFormLinkData[];
	}

	interface IConfiguration {
		CssClass: string | null;
		Group: string | null;
		LayoutCssClass: string | null;
		FallbackToDefaultActions: boolean | null;
	}

	export let controller: OutputController<IData, IOutputFieldMetadata<IConfiguration | null>>;

	let visibleInputs: InputController<any>[] = [];
	let effectiveActions: IFormLinkData[] = [];

	let component = new OutputComponent({
		async refresh() {
			controller.value = controller.value;

			const promises = controller.form?.metadata.InputFields.map(async (inputMetadata) => {
				const input = controller.form!.inputs[inputMetadata.Id];

				// If this is a legacy controller.
				if (input.id == null) {
					const ctrl = defaultControlRegister.createInput({
						metadata: inputMetadata,
						app: controller.app,
						form: controller.form,
						parent: controller
					}).controller;

					await ctrl.setValue(input.value);

					// Originally the input is a legacy (AngularJS) controller.
					// So we remap it to a proper Svelte controller.
					controller.form!.inputs[inputMetadata.Id] = ctrl;
				}
			});

			await Promise.all(promises ?? []);

			let formId = controller.form?.getFormId() ?? null;

			// Force re-rendering of inputs. This is needed in case any of the input
			// field values have been changed (e.g. - as a result `bind-to-output`).
			const formInputsGroup = controller.metadata.Component.Configuration?.Group ?? null;

			visibleInputs =
				controller.form?.metadata.InputFields.filter((t) => t.Hidden === false)
					.filter((t) => t.InputGroup === formInputsGroup)
					.sort((a, b) => a.OrderIndex - b.OrderIndex)
					.map((t) => controller.form!.inputs[t.Id]) ?? [];

			effectiveActions = controller.value?.Actions;

			// Inject the loading group into all actions so FormLinks use the same group
			if (effectiveActions != null) {
				effectiveActions = effectiveActions.map((action) => ({
					...action,
					Group: action.Group ?? formId ?? null
				}));
			}

			const fallbackToDefaultActions =
				controller.metadata.Component.Configuration?.FallbackToDefaultActions ?? true;

			if (effectiveActions == null && fallbackToDefaultActions) {
				effectiveActions = [];

				if (controller.form != null) {
					if (!controller.form.metadata.PostOnLoad || visibleInputs?.length > 0) {
						effectiveActions.push({
							Form: '#submit',
							InputFieldValues: null,
							Label: controller.form.metadata.CustomProperties?.SubmitButtonLabel || 'Submit',
							Group: formId
						});

						if (controller.form?.metadata.CustomProperties?.ShowClearButton == true) {
							effectiveActions.push({
								Form: '#clear',
								InputFieldValues: null,
								Label: 'Clear',
								Group: formId
							});
						}

						if (controller.form.cancel != null) {
							effectiveActions.push({
								Form: '#cancel',
								InputFieldValues: null,
								Label: 'Cancel',
								Group: formId
							});
						}
					}
				}
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function clearInputs() {
		const formInputsGroup = controller.metadata.Component.Configuration?.Group ?? null;

		controller.form?.metadata.InputFields.forEach((input) => {
			if (!input.Hidden) {
				// Clear main inputs
				if (input.InputGroup === formInputsGroup) {
					controller.form?.inputs[input.Id].clear();
				} else if (input.Component.Type == 'table-input') {
					// Clear inputs inside table-input rows
					const tableInputController = controller.form?.inputs[input.Id];
					if (tableInputController != null && tableInputController.table != null) {
						const fields = input.Component.Configuration?.Fields ?? [];
						const inputFields = fields.filter((f: any) => f.IsInput && !f.Metadata.Hidden);

						tableInputController.table.body.forEach((row: any) => {
							if (!row.deleted) {
								inputFields.forEach((field: any) => {
									const cellController = tableInputController.table.controller(row, field.Metadata.Id);
									cellController?.clear();
								});
							}
						});
					}
				}
			}
		});

		visibleInputs = visibleInputs;
	}

	async function submitForm() {
		if (controller.form == null) {
			throw new Error('Cannot submit form, because no corresponding form object is found.');
		}

		let formId = controller.form.getFormId();

		let submitButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll(
			`button[type="submit"][form="${formId}"]`
		);

		if (submitButtons.length > 0) {
			await withButtonLoading(submitButtons, () => controller.form!.submit(), formId);
		} else {
			await controller.form?.submit();
		}
	}
</script>

{#if controller.form != null && controller.metadata.Component.Configuration?.Group == null}
	<form
		id={controller.form.getFormId()}
		name={controller.form.metadata.Id}
		on:submit|preventDefault={submitForm}
	/>
{/if}

{#if controller.form != null && (!controller.form.metadata.PostOnLoad || visibleInputs?.length > 0 || effectiveActions?.length > 0)}
	<div class={controller.metadata.Component.Configuration?.CssClass} class:ui-form-inputs={true}>
		<div
			class:ui-form-inputs_fields={true}
			class={controller.metadata.Component.Configuration?.LayoutCssClass}
		>
			{#each visibleInputs as input}
				<Input controller={input} />
			{/each}
		</div>

		{#if effectiveActions?.length > 0}
			<div class="ui-form-inputs_buttons">
				{#each effectiveActions as action}
					{#if action.Form === '#submit'}
						<button
							class={action.CssClass ?? 'btn btn-primary'}
							type="submit"
							form={controller.form.getFormId()}
						>
							{action.Label}
						</button>
					{:else if action.Form === '#clear'}
						<button
							class={action.CssClass ?? 'btn btn-default'}
							type="button"
							use:onAsyncClick={{
								handler: async () => clearInputs(),
								group: controller.form.getFormId()
							}}
						>
							{action.Label}
						</button>
					{:else if action.Form === '#cancel'}
						<button
							class={action.CssClass ?? 'btn btn-default'}
							type="button"
							use:onAsyncClick={{
								handler: async () => {
									if (controller.form?.cancel) {
										await controller.form.cancel();
									}
								},
								group: controller.form.getFormId()
							}}
						>
							{action.Label}
						</button>
					{:else}
						<FormLinkComponent
							controller={FormlinkUtilities.createFormlink({ data: action, parent: controller })}
						/>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
{/if}
