<script lang="ts" context="module">
	interface FormData {
		Form: string;
		InputFieldValues: any[];
	}

	interface TimelineItem {
		Label: string;
		Date: DateTime;
		Content: string;
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
	import CollapsibleSection from './ConversationCollapsibleSection.svelte';
	import type DateTime from '../DateTime.svelte';
	import ActionList, { ActionListController, type ActionListData } from '../ActionList.svelte';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';

	export let controller: OutputController<Timeline>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	function buildControllers(data: ActionListData) {
		return new OutputController<ActionListData>({
			metadata: {} as IFieldMetadata,
			data: data,
			form: controller.form!,
			app: controller.app
		}) as ActionListController;
	}

	beforeUpdate(async () => await component.setup(controller));

	// Remove potential width attribute in the html string that would break the layout
	function RemoveWidthStyling(Content: string) {
		const regex = /(width:[^;]+;?)|(\s+width:[^;]+;?)/g;
		return Content.replace(regex, '');
	}
</script>

{#if controller.value != null}
	{#each controller.value.Items as item, index}
		<CollapsibleSection
			headerContent={item.Content}
			headerText={item.Label}
			date={item.Date}
			status={item.Status}
			icon={item.Icon}
			style={item.Style}
			isLast={index == controller.value?.Items?.length - 1}
		>
			<div class="collapsible">
				<div class="collapsible-content">
					{@html RemoveWidthStyling(item.Content)}
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
		background-color: #7fd0ff;
		border-radius: 0px 0px 5px 5px;
	}
	.collapsible-content {
		background-color: #dff2ff;
		border-width: 0;
		padding: 15px;
		text-align: left;
		font-size: medium;
	}
</style>
