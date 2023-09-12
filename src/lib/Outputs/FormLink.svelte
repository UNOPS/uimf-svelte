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
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: Controller;

	let allowed: boolean;
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
</script>

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
						controller.app.openModal({
							form: controller.value.Form,
							inputFieldValues: controller.value.InputFieldValues
						});
						break;
					case 'run':
						{
							var callback = function () {
								return controller.app
									.postForm(controller.value.Form, controller.value.InputFieldValues, {
										skipClientFunctions: true
									})
									.then(function (response) {
										controller.app.runResponseHandler(response);
										controller.app.runClientFunctions(response);
										controller.form?.submit(false);
									});
							};

							if (controller.value.ConfirmationMessage != null) {
								return controller.app
									.confirm({
										bodyText: controller.value.ConfirmationMessage
									})
									.then(callback);
							} else {
								callback();
							}
						}
						break;
					case 'open-html-modal':
						{
							let resolve = JSON.parse(controller.value.Resolve) || {};
							resolve.$stateParams = JSON.parse(controller.value.StateParams) || {};

							controller.app
								.openHtmlModal({
									templateUrl: controller.value.TemplateUrl,
									controller: controller.value.Controller,
									data: resolve
								})
								.then(function () {
									controller.form?.submit(true);
								});
						}
						break;
					default:
						controller.app.handleCustomFormLinkAction(controller.value);
						break;
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
