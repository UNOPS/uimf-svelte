<script lang="ts" context="module">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import FormLink, { type IFormLinkData } from '../FormLink/FormLink.svelte';

	import type { IOutputFieldMetadata } from '$lib/Infrastructure/Metadata';
	import { FormlinkUtilities } from '../FormLink/FormlinkUtilities';

	export interface ActionGroup {
		OrderIndex: number;
		Actions: IFormLinkData[];
	}

	export interface ActionListData {
		Actions: IFormLinkData[] | null;
		ActionGroups: ActionGroup[] | null;
	}

	interface IConfiguration {
		CssClass?: string | null;
	}

	export class ActionListController extends OutputController<
		ActionListData,
		IOutputFieldMetadata<IConfiguration>
	> {}
</script>

<script lang="ts">
	export let controller: ActionListController;

	let actionGroups: ActionGroup[] = [];

	let component = new OutputComponent({
		refresh() {
			const value = controller.value;

			// Get action groups (new structure) or create single group from Actions (backwards compatibility)
			if (value?.ActionGroups && value.ActionGroups.length > 0) {
				actionGroups = [...value.ActionGroups]
					.sort((a, b) => a.OrderIndex - b.OrderIndex)
					.filter((g) => g.Actions?.length > 0);
			} else if (value?.Actions && value.Actions.length > 0) {
				actionGroups = [{ OrderIndex: 0, Actions: value.Actions }];
			} else {
				actionGroups = [];
			}

			// Apply default CSS class to all actions
			for (const group of actionGroups) {
				for (const action of group.Actions) {
					action.CssClass = action.CssClass ?? 'btn btn-default';
				}
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if actionGroups.length > 0}
	<div class:action-list={true} class={controller.metadata.Component?.Configuration?.CssClass}>
		{#each actionGroups as group, groupIndex}
			{#if groupIndex > 0}
				<span class="action-group-separator" />
			{/if}
			{#each group.Actions as action}
				<div>
					<FormLink
						controller={FormlinkUtilities.createFormlink({ data: action, parent: controller })}
					/>
				</div>
			{/each}
		{/each}
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	:global(td > .action-list) {
		padding: 3px 0px 3px 5px;
		margin: 0;
		background-color: transparent;

		// Set min-height to zero just to make sure we're not
		// inheriting any value from the parent. We want the
		// action list to be as short as possible within a <td>.
		min-height: 0;

		& > :global(div > .btn) {
			padding-top: 5px;
			padding-bottom: 5px;
			font-size: 0.9em;
		}
	}

	:global(.table > tbody > tr > td:has(.action-list)) {
		padding: 0px;
		width: 1px;
		white-space: nowrap;
	}

	:global(.section > .form-group > div > div > .action-list) {
		background: transparent;
	}

	:global(.action-list) {
		background-color: $app-soft-bg;
		border-width: 0;
		padding: 5px 15px;
		text-align: right;
		margin-left: 0;
		margin-right: 0;
		margin-bottom: 1px;

		& > :global(div) {
			display: inline-block;
			margin-right: 5px;
		}
	}

	.action-group-separator {
		display: inline-block;
		width: 15px;
		text-align: center;
		color: #ccc;
	}
</style>
