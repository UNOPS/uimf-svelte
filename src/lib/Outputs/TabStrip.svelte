<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import FormLink, { type FormLinkData, type FormLinkMetadata } from './FormLink.svelte';
	import type { Controller } from '../Outputs/FormLink.svelte';

	interface TabData extends FormLinkData {
		firstTabInGroup: boolean;
		groupId: number;
	}

	interface TabGroup {
		OrderIndex: number;
		Tabs: TabData[];
	}

	interface TabStripData {
		CurrentTab: string;
		TabGroups: TabGroup[];
		Tabs: TabData[];
	}

	export let controller: OutputController<TabStripData>;

	let tabs: TabData[] = [];

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>(
			{
				metadata: { disabled: false } as FormLinkMetadata,
				data: value,
				form: controller.form!,
				app: controller.app
			}
		) as Controller;
	};

	onMount(() => {
		tabs = [];
		if (controller.value != null) {
			let groupId = 0;
			tabs = controller.value.TabGroups.filter(function (group) {
				return group.Tabs != null && group.Tabs.length > 0;
			})
				.map(function (group) {
					groupId += 1;

					if (groupId > 1) {
						group.Tabs[0].firstTabInGroup = true;
					}

					return group.Tabs.map(function (tab) {
						tab.groupId = groupId;
						return tab;
					});
				})
				.flat(2);
		}
	});
</script>

{#if tabs.length > 0}
	<div class="tabstrip">
		<ul class="nav nav-tabs">
			{#each tabs as tab}
				<li class="nav-item" class:active={tab.Form === controller.value.CurrentTab}>
					{#if tab.firstTabInGroup}
						<span class="separator">~</span>
					{/if}
					<FormLink controller={makeController(tab)} />
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.nav-item a{
		text-decoration: none;
	}

	.nav-item.active a{
		text-decoration: underline;
	}
	.tabstrip {
		background: #ebeef0;
		display: block;
		margin: -25px -20px 20px;
	}

	.nav-item > a {
		background: white;
		border: 1px solid #dedede;
		border-radius: 1px 1px 0 0;
		border-width: 1px 1px 0 1px;
		display: block;
		line-height: 1.42857143;
		margin-right: 2px;
		padding: 10px 15px;
		position: relative;
		text-decoration: none;
	}

	.nav-item.active > a {
		text-decoration: underline;
	}

	span.separator {
		padding: 0 10px;
		font-size: 15px;
		color: #04284f1c;
		position: relative;
		top: 9px;
		font-weight: bold;
	}
</style>
