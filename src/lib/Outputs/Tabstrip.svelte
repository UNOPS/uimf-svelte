<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';

	interface Tab {
		CssClass: string | null | undefined;
		Tooltip: string | null;
		Icon: string | null;
		Form: string;
		InputFieldValues: any;
		Label: string;
		RequiredPermission: string | null;
	}

	interface TabGroup {
		OrderIndex: number;
		Tabs: Tab[];
	}

	interface Tabstrip {
		CurrentTab: string;
		TabGroups: TabGroup[];
		CssClass?: string | null;
	}

	interface Configuration {
		CssClass?: string;
	}

	export let controller: OutputController<Tabstrip, IOutputFieldMetadata<Configuration>>;

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
	<div class:tabstrip={true}>
		<ul class={controller.metadata.Component.Configuration?.CssClass ?? 'nav nav-tabs'}>
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
								<a href={url} use:tooltip={tab.Tooltip}>
									{#if tab.Icon}
										<i class={tab.Icon} />
									{/if}
									{tab.Label}</a
								>
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
		text-decoration: none;
		box-shadow: inset 0px -12px 10px -15px #CCC;
	}

	.nav-pills {
		& li > a {
			text-decoration: none;
			background: #f8f8f8;
			color: #3c53db;
			padding: 5px 10px;
			border-radius: 4px;
			border: 1px solid #9cb2f3;
			margin: 5px 3px 5px 3px;
		}

		& > li.active > a,
		& > li.current > a {
			background: #426a98;
			color: white;
			border-color: white;
		}
	}

	// We implement duplicate class `current` to allow server side to
	// indicate which tab is current by applying this style. This is useful
	// in cases where `Tabstrip.CurrentTab` cannot be set for some reason.
	.nav-tabs > li.active > a,
	.nav-tabs > li.current > a {
		text-shadow: 0px 1px #3c719b;
		border-bottom-color: transparent;
		box-shadow: none;
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
