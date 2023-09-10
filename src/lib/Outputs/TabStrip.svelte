<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import type { FormLinkData } from './FormLink.svelte';

	interface Tab {
		Form: string;
		InputFieldValues: any;
		Label: string;
		Style: string;
	}

	interface TabGroup {
		OrderIndex: number;
		Tabs: Tab[];
	}

	interface Tabstrip {
		CurrentTab: string;
		TabGroups: TabGroup[];
	}

	export let controller: OutputController<Tabstrip>;

	class TabDisplayData implements Tab {
		showGroupSeparatorBeforeTab: boolean;

		constructor(tab:Tab) {
			this.Form = tab.Form;
			this.Label = tab.Label;
			this.InputFieldValues = tab.InputFieldValues;
			this.Style = tab.Style;
		}
	}

	let tabs: TabDisplayData[] = [];

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;

			const tabGroups = controller.value?.TabGroups ?? [];

			let groupId = 0;

			tabs = tabGroups
				.filter(function (group) {
					return group.Tabs != null && group.Tabs.length > 0;
				})
				.map(function (group) {
					groupId += 1;

					return group.Tabs.map(function (tab, index) {
						var display = new TabDisplayData(tab);
						display.showGroupSeparatorBeforeTab = groupId > 1 && index == 0;

						return display;
					});
				})
				.flat(2);
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if tabs.length > 0}
	<div class="tabstrip">
		<ul class="nav nav-tabs">
			{#each tabs as tab}
				<li class="nav-item" class:active={tab.Form === controller.value.CurrentTab}>
					{#if tab.showGroupSeparatorBeforeTab}
						<span class="separator">~</span>
					{/if}
					{#await controller.app.makeUrl(tab) then url}
						<a href={url}>{tab.Label}</a>
					{/await}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.nav-tabs > li > a {
		color: #555;
		cursor: pointer;
		background-color: #fff;
		border: 1px solid #ddd;
		border-bottom-color: transparent;
		text-decoration: none;
	}

	.nav-tabs > li.active > a {
		text-decoration: underline;
	}
</style>
