<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import DateTime, { DateTimeController } from '../DateTime/DateTime.svelte';
	import type { IFormLinkData } from '../FormLink/FormLink.svelte';
	import FormLink from '../FormLink/FormLink.svelte';
	import { FormlinkUtilities } from '../FormLink/FormlinkUtilities';
	import { OutputFieldMetadataFactory } from '$lib/Infrastructure/OutputFieldMetadataFactory';

	interface EventDescriptionData {
		Event: string | null;
		Date: string;
		HideTime: boolean;
		DisplayFormat: string;
		TriggeredBy: IFormLinkData | null;
	}

	export let controller: OutputController<EventDescriptionData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeDateTimeController = (value: EventDescriptionData) => {
		return new DateTimeController({
			metadata: OutputFieldMetadataFactory.fromComponent({
				Type: 'datetime',
				Configuration: {
					HideTime: value?.HideTime ?? false
				}
			}),
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
				<FormLink
					controller={FormlinkUtilities.createFormlink({
						data: controller.value.TriggeredBy,
						parent: controller
					})}
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
{/if}
