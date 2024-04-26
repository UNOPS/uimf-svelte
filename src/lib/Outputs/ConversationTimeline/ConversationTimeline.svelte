<script lang="ts" context="module">
	interface FormData {
		Form: string;
		InputFieldValues: any[];
	}

	interface TimelineItem {
		Label: string;
		Date: DateTime;
		Content: string;
		IsExternal: boolean;
		Icon: string;
		Color: string;
		Action: FormLinkData | null;
	}

	interface Timeline {
		Items: TimelineItem[];
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import CollapsibleSection from './ConversationCollapsibleSection.svelte';
	import type DateTime from '../DateTime.svelte';
	import type { FormLinkData } from '../FormLink.svelte';

	export let controller: OutputController<Timeline>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	// Remove potential width attribute in the html string that would break the layout
	function RemoveWidthStyling(Content: string) {
		const regex = /(width:[^;]+;?)|(\s+width:[^;]+;?)/g;
		return Content.replace(regex, '');
	}

	function AddOpacity(hex: string | null) {
		if (!hex) {
			return 'gray';
		}

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		var colorArray = result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
					a: 0.3
			  }
			: { r: 10, g: 20, b: 30, a: 0.3 };

		return `rgba(${colorArray.r}, ${colorArray.g}, ${colorArray.b}, ${colorArray.a})`;
	}
</script>

{#if controller.value != null}
	{#each controller.value.Items as item, index}
		<CollapsibleSection
			{controller}
			action={item.Action}
			headerContent={item.Content}
			headerText={item.Label}
			date={item.Date}
			isExternal={item.IsExternal}
			icon={item.Icon}
			color={item.Color}
			isLast={index == controller.value?.Items?.length - 1}
		>
			<div class="collapsible" style:background-color={AddOpacity(item.Color)}>
				<div class="collapsible-content">
					{@html RemoveWidthStyling(item.Content)}
				</div>
			</div>
		</CollapsibleSection>
	{/each}
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';
	.collapsible {
		padding: 0px 3px 3px;
		border-radius: 0px 0px 5px 5px;
	}

	.collapsible-content {
		border-width: 0;
		padding: 15px;
		text-align: left;
		font-size: medium;
	}
</style>
