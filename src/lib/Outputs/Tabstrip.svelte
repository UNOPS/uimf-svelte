<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';

	interface Tab {
		Tooltip: string | null;
		Form: string;
		InputFieldValues: any;
		Label: string;
		RequiredPermission: string | null;
		CssClass?: string | null;
	}

	interface TabGroup {
		OrderIndex: number;
		Tabs: Tab[];
	}

	interface Tabstrip {
		CurrentTab: string;
		TabGroups: TabGroup[];
		CssClass: string;
	}

	export let controller: OutputController<Tabstrip>;

	let tabGroups: TabGroup[] = [];

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			tabGroups = (controller.value?.TabGroups ?? []).filter(function (group) {
				return group.Tabs?.length > 0;
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if tabGroups.length > 0}
	<div class="tabstrip">
		<ul class={controller.value.CssClass ?? 'nav nav-tabs'}>
			{#each tabGroups as group, groupIndex}
				{#each group.Tabs as tab, tabIndex}
					{#if groupIndex > 0 && tabIndex == 0}
						<li>
							<span class="separator">~</span>
						</li>
					{/if}
					{#if controller.app.hasPermission(tab.RequiredPermission)}
						<li
							class:nav-item={true}
							class:active={tab.Form === controller.value.CurrentTab}
							class={tab.CssClass}
						>
							{#await controller.app.makeUrl(tab) then url}
								<a href={url} use:tooltip={tab.Tooltip}>{tab.Label}</a>
							{/await}
						</li>
					{/if}
				{/each}
			{/each}
		</ul>
	</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.nav-tabs > li > a {
		color: #555;
		cursor: pointer;
		background-color: #fff;
		border: 1px solid #ddd;
		border-bottom-color: transparent;
		text-decoration: none;
	}

	// We implement duplicate class `current` to allow server side to
	// indicate which tab is current by applying this style. This is useful
	// in cases where `Tabstrip.CurrentTab` cannot be set for some reason.
	.nav-tabs > li.active > a,
	.nav-tabs > li.current > a {
		text-decoration: underline;
	}

	.separator {
		padding: 0 10px;
		font-size: 15px;
		color: #04284f1c;
		position: relative;
		top: 9px;
		font-weight: bold;
	}
</style>
