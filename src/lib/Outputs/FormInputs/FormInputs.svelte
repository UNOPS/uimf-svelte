<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { InputController } from '../../Infrastructure/InputController';
	import Input from '../../Input.svelte';
	import { defaultControlRegister } from '../../Infrastructure/ControlRegister';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import type { IFormLinkData } from '../FormLink/FormLink.svelte';
	import FormLinkComponent from '../FormLink/FormLink.svelte';
	import { FormlinkUtilities } from '../FormLink/FormlinkUtilities';

	interface IData {
		Actions: IFormLinkData[];
	}

	interface IConfiguration {
		CssClass: string | null;
		Layout: FormInputLayout | null;
	}

	enum FormInputLayout {
		Default = 0,
		Centered = 10,
		Inline = 20
	}

	export let controller: OutputController<IData, IOutputFieldMetadata<IConfiguration | null>>;

	let visibleInputs: InputController<any>[] = [];
	let effectiveActions: IFormLinkData[] = [];
	let layout: FormInputLayout = FormInputLayout.Default;

	let component = new OutputComponent({
		async refresh() {
			controller.value = controller.value;

			layout = controller.metadata.Component.Configuration?.Layout ?? FormInputLayout.Default;

			const promises = controller.form?.metadata.InputFields.map(async (inputMetadata) => {
				const input = controller.form!.inputs[inputMetadata.Id];

				// If this is a legacy controller.
				if (input.id == null) {
					const ctrl = defaultControlRegister.createInput({
						metadata: inputMetadata,
						app: controller.app,
						form: controller.form
					}).controller;

					await ctrl.setValue(input.value);

					// Originally the input is a legacy (AngularJS) controller.
					// So we remap it to a proper Svelte controller.
					controller.form!.inputs[inputMetadata.Id] = ctrl;
				}
			});

			await Promise.all(promises ?? []);

			// Force re-rendering of inputs. This is needed in case any of the input
			// field values have been changed (e.g. - as a result `bind-to-output`).
			visibleInputs =
				controller.form?.metadata.InputFields.filter((t) => t.Hidden === false)
					.sort((a, b) => a.OrderIndex - b.OrderIndex)
					.map((t) => controller.form!.inputs[t.Id]) ?? [];

			effectiveActions = controller.value?.Actions;

			if (effectiveActions == null) {
				effectiveActions = [];

				if (controller.form != null) {
					if (!controller.form.metadata.PostOnLoad || visibleInputs?.length > 0) {
						effectiveActions.push({
							Form: '#submit',
							InputFieldValues: null,
							Label: controller.form.metadata.CustomProperties.SubmitButtonLabel || 'Submit'
						});

						if (controller.form?.metadata.CustomProperties.ShowClearButton) {
							effectiveActions.push({
								Form: '#clear',
								InputFieldValues: null,
								Label: 'Clear'
							});
						}

						if (controller.form.cancel != null) {
							effectiveActions.push({
								Form: '#cancel',
								InputFieldValues: null,
								Label: 'Cancel'
							});
						}
					}
				}
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function clearInputs() {
		controller.form?.metadata.InputFields.forEach((input) => {
			if (!input.Hidden) {
				controller.form?.inputs[input.Id].setValue(null);
			}
		});

		visibleInputs = visibleInputs;
	}

	function submitForm() {
		controller.form?.submit();
	}
</script>

{#if controller.form != null && (!controller.form.metadata.PostOnLoad || visibleInputs?.length > 0 || controller.value?.Actions?.length > 0)}
	<form
		name={controller.form?.metadata.Id}
		on:submit|preventDefault={submitForm}
		class={controller.metadata.Component.Configuration?.CssClass}
		class:inline-layout={layout === FormInputLayout.Inline}
	>
		<div class="inputs">
			{#each visibleInputs as input}
				<div>
					<Input controller={input} />
				</div>
			{/each}
		</div>

		<div class="buttons">
			{#each effectiveActions as action}
				{#if action.Form === '#submit'}
					<button class={action.CssClass ?? 'btn btn-primary'} type="submit">
						{action.Label}
					</button>
				{:else if action.Form === '#clear'}
					<button class={action.CssClass ?? 'btn btn-default'} on:click={clearInputs} type="button">
						{action.Label}
					</button>
				{:else if action.Form === '#cancel'}
					<button
						class={action.CssClass ?? 'btn btn-default'}
						type="button"
						on:click={controller.form.cancel}
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
	</form>
{/if}

<style lang="scss">
	.inputs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
		grid-gap: 10px;
		margin-bottom: 20px;
	}

	form.vertical > .inputs {
		grid-template-columns: 1fr;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: 5px;
	}

	.inline-layout {
		display: flex;
		gap: 5px;
		align-items: center;

		& > .buttons {
			height: 37px;
			position: relative;
			top: 1px;
		}
	}
</style>
