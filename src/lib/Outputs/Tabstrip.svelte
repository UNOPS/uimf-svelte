<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	interface Tab {
		Form: string;
		InputFieldValues: any;
		Label: string;
		Style: string;
		RequiredPermission: string | null;
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
						<li class="nav-item" class:active={tab.Form === controller.value.CurrentTab}>
							{#await controller.app.makeUrl(tab) then url}
								<a href={url}>{tab.Label}</a>
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

	.nav-tabs > li.active > a {
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
