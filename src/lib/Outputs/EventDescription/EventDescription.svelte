<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import DateTime, { DateTimeController } from '../DateTime/DateTime.svelte';
	import type { FormLinkData } from '../FormLink/FormLink.svelte';
	import FormLink from '../FormLink/FormLink.svelte';
	import type { IFieldMetadata } from '../../Infrastructure/uimf';

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
			app: controller.app,
			parent: controller
		});
	};

	const makeDateTimeController = (value: EventDescriptionData) => {
		return new DateTimeController({
			metadata: {
				Id: '',
				Hidden: false,
				Label: '',
				OrderIndex: 0,
				Component: {
					Type: 'datetime',
					Configuration: {
						HideTime: value?.HideTime ?? false
					}
				}
			},
			data: value.Date,
			form: controller.form!,
			app: controller.app,
			parent: controller
		});
	};
</script>

{#if controller.value != null}
	<DateTime controller={makeDateTimeController(controller.value)} />

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
