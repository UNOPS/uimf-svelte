<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import { OutputController } from '../Infrastructure/OutputController';
	import { InputController } from '../Infrastructure/InputController';
	import Input from '../Input.svelte';
	import { defaultControlRegister } from '../Infrastructure/ControlRegister';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';

	interface IData {}

	interface IConfiguration {
		CssClass: string | null;
	}

	export let controller: OutputController<IData, IOutputFieldMetadata<IConfiguration>>;

	let visibleInputs: InputController<any>[] = [];

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
						defer: input.loadDefer
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

{#if controller.form != null && (!controller.form.metadata.PostOnLoad || visibleInputs?.length > 0)}
	<form
		name={controller.form?.metadata.Id}
		on:submit|preventDefault={submitForm}
		class={controller.metadata.Component.Configuration.CssClass}
	>
		<div class="inputs">
			{#each visibleInputs as input}
				<div>
					<Input controller={input} />
				</div>
			{/each}
		</div>

		<div class="text-right">
			<button class="btn btn-primary" type="submit">
				{controller.form.metadata.CustomProperties.SubmitButtonLabel || 'Submit'}
			</button>

			{#if controller.form.cancel != null}
				<button class="btn btn-default" type="button" on:click={controller.form.cancel}
					>Cancel</button
				>
			{/if}

			{#if controller.form.metadata.CustomProperties.ShowClearButton}
				<button class="btn btn-default" on:click={clearInputs} type="button">Clear</button>
			{/if}
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
</style>
