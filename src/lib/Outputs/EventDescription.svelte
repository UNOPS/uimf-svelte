<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import DateTime, { DateTimeController } from './DateTime.svelte';
	import type { FormLinkData } from './FormLink.svelte';
	import FormLink from './FormLink.svelte';
	import type { IFieldMetadata } from '../Infrastructure/uimf';

	interface EventDescriptionData {
		Event: string | null;
		Date: string;
		HideTime: boolean;
		DisplayFormat: string;
		TriggeredBy: FormLinkData | null;
	}

	export let controller: OutputController<EventDescriptionData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeFormLinkController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>({
			metadata: {} as IFieldMetadata,
			data: value,
			form: controller.form!,
			app: controller.app
		});
	};

	const makeDateTimeController = () => {
		return new DateTimeController({
			metadata: {
				Id: '',
				Required: false,
				Hidden: false,
				Label: '',
				OrderIndex: 0,
				Component: {
					Type: 'datetime',
					Configuration: {
						HideTime: controller.value?.HideTime ?? false
					}
				}
			},
			data: controller.value.Date,
			form: controller.form!,
			app: controller.app
		});
	};
</script>

{#if controller.value != null}
	<DateTime controller={makeDateTimeController()} />

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
				<FormLink controller={makeFormLinkController(controller.value.TriggeredBy)} />
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
{/if}
