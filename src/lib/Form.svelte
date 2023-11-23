<script lang="ts">
	import { tooltip } from './Components/Tooltip.svelte';
	import { beforeUpdate, onDestroy } from 'svelte';
	import { FormComponent } from './Infrastructure/Component';
	import Output from './Output.svelte';
	import Input from './Input.svelte';
	import type { FormController } from './Infrastructure/FormController';

	export let controller: FormController;
	export let onCancel: (() => any) | null = null;
	export let onSubmit: (() => any) | null = null;
	export let onFormLoaded: ((arg0: any) => any) | null = null;
	export let onFormFailed: ((arg0: any) => any) | null = null;

	let component = new FormComponent({
		async init() {
			controller.onFormLoaded = onFormLoaded;
			controller.onFormFailed = onFormFailed;
			await controller.init();
		},
		refresh() {
			controller.hasResponse = controller.hasResponse;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const handleSubmit = async (event: Event | null, asPostOnLoad: boolean) => {
		if (event != null) {
			event.preventDefault();
		}
		return controller.submit(asPostOnLoad).then(() => {
			onSubmit?.();
			return Promise.resolve();
		});
	};

	const handleCancel = () => {
		onCancel?.();
	};

	onDestroy(() => {
		controller.destroy();
	});
</script>

{#if controller == null}
	<div class="clearfix alert alert-warning">Cannot find the page you requested...</div>
{/if}

<div
	class={`clearfix uimf-form ${controller.metadata.CustomProperties.cssClass} ${
		controller.hasVisibleInputs ? '' : 'no-visible-inputs'
	}  ${controller.hasVisibleOutputs ? '' : 'no-visible-outputs'}`}
>
	<nav>
		<ol class="breadcrumb">
			{#each controller.breadcrumbs as breadcrumbController}
				<li class="breadcrumb-item">
					<Output controller={breadcrumbController} hideLabel={true} />
				</li>
			{/each}
		</ol>
	</nav>

	{#if controller.useUrl}
		<h1 class="page-header text-overflow">
			{controller.title}
		</h1>
	{/if}

	{#if controller.hasResponse && controller.getTopOutputControllers().length > 0}
		<div class="panel uimf-output uimf-output-top">
			<div class="panel-body">
				{#each controller.getTopOutputControllers() as outputController}
					<div>
						<Output controller={outputController} hideLabel={false} />
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if controller.hasResponse && controller.getAboveInputsOutputControllers().length > 0}
		<div class="uimf-form-top-fields">
			{#each controller.getAboveInputsOutputControllers() as outputController}
				<div>
					<Output controller={outputController} hideLabel={true} />
				</div>
			{/each}
		</div>
	{/if}

	{#if controller.metadata.CustomProperties.documentation}
		<div class="documentation">
			{@html controller.metadata.CustomProperties.documentation}
		</div>
	{/if}

	{#if controller.hasVisibleInputs || !controller.metadata.PostOnLoad}
		<form
			class="form-horizontal panel"
			name={controller.metadata.Id}
			on:submit={async (e) => await handleSubmit(e, false)}
		>
			{#if controller.hasVisibleInputs}
				<div class="panel-body">
					{#each controller.getInputControllers() as inputController}
						<div class="col-sm-6">
							<div
								class={`form-group uimf-input-wrapper ${
									inputController.metadata.CustomProperties?.cssClass ?? ''
								}`}
							>
								{#if inputController.metadata.Label.length > 0}
									<label
										for={inputController.metadata.Id}
										class={`col-xs-4 control-label ${
											inputController.metadata.CustomProperties?.documentation != null
												? 'has-documentation'
												: ''
										}`}
										use:tooltip={inputController.metadata.CustomProperties?.documentation}
									>
										{inputController.metadata.Label}
									</label>
								{/if}
								<div class="col-xs-8">
									<Input controller={inputController} hideLabel={true} />
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
			{#if (controller.hasVisibleInputs || !controller.metadata.PostOnLoad) && controller.metadata.CustomProperties.SubmitButtonLabel !== ''}
				<div class="panel-footer text-right">
					<button class="btn btn-primary btn-lg" type="submit">
						{controller.metadata.CustomProperties.SubmitButtonLabel || 'Submit'}
					</button>
					{#if onCancel != null}
						<button class="btn btn-secondary btn-lg" on:click={handleCancel} type="button">
							Cancel
						</button>
					{/if}
					{#if controller.metadata.CustomProperties.ShowClearButton}
						<button
							class="btn btn-secondary btn-lg"
							on:click={() => {
								controller.clearInput();
							}}
							type="button"
						>
							Clear
						</button>
					{/if}
				</div>
			{/if}
		</form>
	{/if}

	{#if controller.hasResponse && controller.getBelowInputsOutputControllers().length > 0}
		<div class="panel uimf-output">
			<div class="panel-body">
				{#each controller.getBelowInputsOutputControllers() as outputController}
					<div>
						<Output controller={outputController} hideLabel={false} />
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.panel-footer {
		display: flex;
		flex-direction: row;
		gap: 15px;
		justify-content: flex-end;
		background-color: white;
	}

	.btn-primary {
		color: white;
	}

	.btn-primary:hover {
		color: white;
	}
</style>
