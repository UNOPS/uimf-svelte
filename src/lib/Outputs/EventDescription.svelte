<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import DateTime, { DateTimeController } from './DateTime.svelte';
	import type { Controller, FormLinkData, FormLinkMetadata } from './FormLink.svelte';
	import FormLink from './FormLink.svelte';

	interface EventDescriptionData {
		Event: string | null;
		Date: string;
		HideTime: boolean;
		DisplayFormat: string;
		TriggeredBy: FormLinkData | null;
	}

	export let controller: OutputController<EventDescriptionData>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>(
			{ disabled: false } as FormLinkMetadata,
			value,
			controller.form,
			controller.app
		) as Controller;
	};
</script>

<DateTime
	controller={new DateTimeController(
		{ HideTime: controller.value.HideTime },
		controller.value.Date,
		controller.form,
		controller.app
	)}
/>

{#if controller.value.Event != null && controller.value.DisplayFormat === 'DateEventUser'}
	<span>
		{controller.value.Event}
	</span>
{/if}

{#if controller.value.TriggeredBy != null}
	<span>
		{#if controller.value.DisplayFormat === 'DateEventUser'}
			<span>by</span>
		{/if}
		{#if controller.value.TriggeredBy.Form !== null}
			<FormLink
				controller={makeController(controller.value.TriggeredBy)}
			/>
		{:else}
			<span>
				{controller.value.TriggeredBy.Label}
			</span>
		{/if}
	</span>
{/if}

{#if controller.value.Event != null && controller.value.DisplayFormat === 'DateUserEvent'}
	<span>
		{controller.value.Event}
	</span>
{/if}
