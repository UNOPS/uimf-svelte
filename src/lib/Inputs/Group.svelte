<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface IGroups {
		Items: Record<string, IItem[]>;
	}

	interface IItem {
		Label: string;
		Link: any;
		Value: any;
	}

	interface IGroup {
		Index: number;
		Name: string;
		Items: IItem[];
	}

	export class Controller extends InputController<IGroups> {
		public getValue(): Promise<IGroups | null> {
			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<IGroups | null> {
			if (value == null) {
				return Promise.resolve(null);
			}

			return Promise.resolve(JSON.parse(value));
		}

		public serialize(value: IGroups | null): string | null {
			if (value == null) {
				return null;
			}

			return JSON.stringify(value);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let groups: IGroup[] = [];

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			console.log(controller.value);

			if (controller.value?.Items != null) {
				groups = Object.entries(controller.value.Items).map(([name, items], index) => ({
					Index: index,
					Name: name,
					Items: items
				}));
			} else {
				groups = [];
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function move(item: IItem, currentGroupIndex: number, targetGroupIndex: number): void {
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
	}

	function moveAll(currentGroupIndex: number, targetGroupIndex: number): void {
		const currentGroup = groups[currentGroupIndex];
		const targetGroup = groups[targetGroupIndex];

		currentGroup.Items.forEach((i) => {
			targetGroup.Items.push(i);
		});

		currentGroup.Items.splice(0, currentGroup.Items.length);

		groups = groups;
	}
</script>

{#if controller.value != null}
	<div class="groups">
		{#each groups as group}
			<div class="group">
				<div>
					{#if group.Index > 0}
						<button
							type="button"
							class="btn"
							on:click={() => moveAll(group.Index, group.Index - 1)}
						>
							<i class="fa fa-solid fa-arrow-left" />
						</button>
					{/if}

					<h6>{group.Name}</h6>

					{#if group.Index < groups.length - 1}
						<button
							type="button"
							class="btn"
							on:click={() => moveAll(group.Index, group.Index + 1)}
						>
							<i class="fa fa-solid fa-arrow-right" />
						</button>
					{/if}
				</div>

				<ul>
					{#each group.Items as item}
						<li>
							{#if group.Index > 0}
								<button
									type="button"
									class="btn"
									on:click={() => move(item, group.Index, group.Index - 1)}
								>
									<i class="fa fa-solid fa-arrow-left" />
								</button>
							{/if}

							<div>
								{item.Label}
								<a href={item.Link}><i class="fa fa-external-link-alt fa-1x" /></a>
							</div>

							{#if group.Index < groups.length - 1}
								<button
									type="button"
									class="btn"
									on:click={() => move(item, group.Index, group.Index + 1)}
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
		border-width: 1px 1px 1px 0;
		flex-grow: 1;

		&:first-child {
			border-left-width: 1px;
		}

		& > div {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: #2d3c4b;
			color: #fff;
			font-weight: bold;
			padding: 5px 10px;

			& > h6 {
				flex-grow: 1;
				text-align: center;
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

			&:hover {
				background: #f0f2f6;
			}

			& > div {
				flex-grow: 1;
				text-align: center;
			}
		}
	}

	a {
		padding: 0 5px;
		text-decoration: none;
	}
</style>
