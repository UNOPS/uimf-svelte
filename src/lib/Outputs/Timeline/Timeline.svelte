<script lang="ts" context="module">
	interface FormData {
		Form: string;
		InputFieldValues: any[];
	}

	interface TimelineItem {
		Label: string;
		Date: DateTime;
		Content: string;
		ContentForm: FormData;
		Status: string;
		Icon: string;
		Style: string;
		Actions: ActionListData | null;
	}

	interface Timeline {
		Items: TimelineItem[];
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import CollapsibleSection from './CollapsibleSection.svelte';
	import type DateTime from '../DateTime/DateTime.svelte';
	import ActionList, {
		ActionListController,
		type ActionListData
	} from '../ActionList/ActionList.svelte';
	import type { IOutputFieldMetadata } from '$lib/Infrastructure/Metadata';
	import InlineForm from '../InlineForm/InlineForm.svelte';

	export let controller: OutputController<Timeline>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	function buildControllers(data: ActionListData) {
		return new OutputController<ActionListData>({
			metadata: {} as IOutputFieldMetadata,
			data: data,
			form: controller.form!,
			app: controller.app,
			parent: controller
		}) as ActionListController;
	}

	function getController(data: FormData) {
		return new OutputController<FormData>({
			metadata: {} as IOutputFieldMetadata,
			data: data,
			form: controller.form!,
			app: controller.app,
			parent: controller
		});
	}

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	{#each controller.value.Items as item, index}
		<CollapsibleSection
			headerText={item.Label}
			date={item.Date}
			status={item.Status}
			icon={item.Icon}
			style={item.Style}
			isLast={index == controller.value?.Items?.length - 1}
		>
			<div class="collapsible">
				<div class="collapsible-content">
					{@html item.Content}
					<InlineForm controller={getController(item.ContentForm)} />
				</div>
				{#if item.Actions}
					<ActionList controller={buildControllers(item.Actions)} />
				{/if}
			</div>
		</CollapsibleSection>
	{/each}
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';
	.collapsible {
		padding: 0px 3px 3px;
		background-color: #f1f1f1;
		border-radius: 0px 0px 5px 5px;
	}
	.collapsible-content {
		background-color: $app-soft-bg;
		border-width: 0;
		padding: 5px 15px;
		text-align: left;
	}
</style>
