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
		return new OutputController<FormLinkData>({
			metadata: { disabled: false } as FormLinkMetadata,
			data: value,
			form: controller.form!,
			app: controller.app
		}) as Controller;
	};

	const createDateTimeController = () => {
		return new DateTimeController({
			metadata: { HideTime: controller.value.HideTime },
			data: controller.value.Date,
			form: controller.form!,
			app: controller.app
		});
	}
</script>

<DateTime controller={createDateTimeController()} />

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
