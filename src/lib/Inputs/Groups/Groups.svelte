<script lang="ts" context="module">
	import { GroupsController } from './GroupsController';
	export { GroupsController as Controller };
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IItem } from './IItem';
	import type { IGroup } from './IGroup';
	import type { IGroups } from './IGroups';

	export let controller: GroupsController;

	let groups: IGroup[] = [];
	let queries: Record<number, string> = {};

	let component = new InputComponent({
		refresh() {
			if (controller.value?.Items != null) {
				groups = Object.entries(controller.value.Items).map(([name, items], index) => ({
					Index: index,
					Name: name,
					Items: items.map((t) => ({
						...t,
						SearchText: t.Label.toLowerCase()
					}))
				}));
			} else {
				groups = [];
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function updateValue() {
		// Convert `groups` array into an IGroups instance
		const items: IGroups = {
			Items: groups.reduce((acc, group) => {
				acc[group.Name] = group.Items.map(({ SearchText, ...rest }) => rest);
				return acc;
			}, {} as Record<string, IItem[]>)
		};

		await controller.setValue(items);
	}

	async function move(
		item: IItem,
		currentGroupIndex: number,
		targetGroupIndex: number
	): Promise<void> {
		let currentGroup = groups[currentGroupIndex];
		let targetGroup = groups[targetGroupIndex];

		if (currentGroup) {
			if (currentGroup.Items.indexOf(item) !== -1) {
				currentGroup.Items.splice(currentGroup.Items.indexOf(item), 1);
			}
		}

		if (targetGroup) {
			targetGroup.Items.push(item);
		}

		groups = groups;

		await updateValue();
	}

	async function moveAll(group: IGroup, targetGroupIndex: number): Promise<void> {
		const targetGroup = groups[targetGroupIndex];

		const query = queries[group.Index]?.trim().toLowerCase() ?? null;

		// Collect indices and items to move in reverse order for efficient removal.
		const itemsToMove: IItem[] = [];
		const indicesToRemove: number[] = [];

		group.Items.forEach((item, index) => {
			// If query is specified then only take matching items,
			// otherwise take all items.
			let match =
				query?.length > 0
					? (item.SearchText ?? item.Label.toLowerCase()).indexOf(query) >= 0
					: true;

			if (match) {
				itemsToMove.push(item);
				indicesToRemove.push(index);
			}
		});

		// Remove items from source group in reverse order to avoid index shifting
		// and add items to target group
		for (let i = indicesToRemove.length - 1; i >= 0; i--) {
			group.Items.splice(indicesToRemove[i], 1);
		}

		targetGroup.Items.push(...itemsToMove);

		// Sort the target group because it now has some new items.
		// The source group does not need to be sorted because we only
		// removed things so it's just gonna shrink.
		targetGroup.Items.sort((a, b) => a.Label.localeCompare(b.Label));

		groups = groups;

		await updateValue();
	}

	function getItems(group: IGroup, query: string | null | undefined): IItem[] {
		query = query?.trim();

		if (query == null || query.length == 0) {
			return group.Items;
		}

		query = query.toLowerCase();

		return group.Items.filter((t) => {
			const label = t.SearchText ?? t.Label.toLowerCase();
			return label.indexOf(query!) >= 0;
		});
	}
</script>

{#if controller.value != null}
	<div class="groups">
		{#each groups as group}
			<div class="group">
				<div class="group-header">
					{#if group.Index > 0}
						<button
							type="button"
							class="btn btn-link space"
							on:click={async () => await moveAll(group, group.Index - 1)}
						>
							<i class="fa fa-solid fa-arrow-left" />
						</button>
					{:else}
						<span class="space" />
					{/if}

					<h6>{group.Name}</h6>

					{#if group.Index < groups.length - 1}
						<button
							type="button"
							class="btn btn-link space"
							on:click={async () => await moveAll(group, group.Index + 1)}
						>
							<i class="fa fa-solid fa-arrow-right" />
						</button>
					{:else}
						<span class="space" />
					{/if}
				</div>

				<div
					class="group-search"
					class:left={group.Index > 0}
					class:right={group.Index < groups.length - 1}
				>
					<span class="space" />
					<input
						type="text"
						placeholder="Type to search"
						name="group-{group.Index}"
						bind:value={queries[group.Index]}
					/>
					<button
						type="button"
						class="btn btn-link space"
						on:click={() => {
							queries[group.Index] = '';
						}}
					>
						<i class="fa-solid fa-xmark" />
					</button>
				</div>

				<ul>
					{#each getItems(group, queries[group.Index]) as item}
						<li>
							{#if group.Index > 0}
								<button
									type="button"
									class="btn"
									on:click={async () => await move(item, group.Index, group.Index - 1)}
								>
									<i class="fa fa-solid fa-arrow-left" />
								</button>
							{/if}

							<div>
								{item.Label}
								{#if item.Link != null}
									<a href={item.Link.Url}><i class="fa fa-external-link-alt fa-1x" /></a>
								{/if}
							</div>

							{#if group.Index < groups.length - 1}
								<button
									type="button"
									class="btn"
									on:click={async () => await move(item, group.Index, group.Index + 1)}
								>
									<i class="fa fa-solid fa-arrow-right" />
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.groups {
		display: flex;
		justify-content: space-between;
	}

	.group {
		border: 1px solid #bfc6ce;
		border-width: 1px;
		flex-grow: 1;

		& > .group-header {
			display: flex;
			justify-content: space-between;
			align-items: center;

			padding: 5px 10px;

			border-left-width: 1px;
			background: #2d3c4b;
			color: #fff;
			font-weight: bold;

			& > h6 {
				flex-grow: 1;
				text-align: center;
				color: #fff;
				margin: 0;
			}

			& > .space {
				color: #fff;
				width: 50px;
			}
		}

		.group-search {
			display: flex;
			padding: 5px 10px;

			border-style: solid;
			border-color: #bfc6ce;
			border-width: 1px 0;

			& > input {
				flex-grow: 1;
				border: none;
				padding: 5px 10px;
				outline: none;
				color: #000;
				text-align: center;
				font-weight: normal;
			}

			& > .space {
				width: 50px;
			}
		}
	}

	ul {
		height: 300px;
		list-style-type: none;
		overflow-y: auto;
		padding: 0;
		margin: 0;

		& > li {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-spacing: 2px;
			border-bottom: 1px solid #eee;
			padding: 5px 10px;
			margin: 0;

			&:hover {
				background: #f0f2f6;
			}

			& > div {
				flex-grow: 1;
				text-align: left;
				padding-left: 20px;
			}
		}
	}

	a {
		padding: 0 5px;
		text-decoration: none;
	}

	button.btn {
		padding: 5px;
		border: none;
		background: transparent;
		color: #888;
	}
</style>
