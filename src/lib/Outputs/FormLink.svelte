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

	export class Controller extends OutputController<FormLinkData> {}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: Controller;

	let allowed: boolean;
	let cssClass: string;

	let component = new OutputComponent({
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
					>{#if controller.value.Icon}<i
							class={controller.value.Icon}
							aria-hidden="true"
						/>{/if}{controller.value.Label}</a
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
						const originalUrl = window.location.href;

						controller.app
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
							.then(function () {
								if (controller.form != null && location.href === originalUrl) {
									// If parent form is a "record", meaning that initially it's called with
									// "operation=get" and the subsequent calls are done with "operation=post".
									if (
										controller.form.metadata.PostOnLoadValidation === false &&
										controller.form.inputs['Operation']
									) {
										// Mimic the initial "get" call, so that we reload the parent form.
										controller.form.inputs['Operation'].value = null;
										controller.form.submit(true);
									} else {
										// For regular "non-record" forms we just re-submit the form normally.
										controller.form.submit(false);
									}
								}
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
		color: $link-color;
	}

	.btn-default {
		background-color: #fafafa;
		border-color: $app-btn-border-color;
		color: $link-color;
	}

	.btn {
		border-radius: 0;
		font-size: 1em;

		&:hover {
			border-color: $app-btn-border-color;
		}
	}
</style>
