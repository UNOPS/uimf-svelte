<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface IGroup {
		Items: Record<string, IItem[]>;
	}
	interface IItem {
		Label: string;
		Link: any;
		Value: any;
	}

	export class Controller extends InputController<IGroup> {
		public getValue(): Promise<IGroup | null> {
			return Promise.resolve(this.value);
		}
		public deserialize(value: string | null): Promise<IGroup | null> {
			if (value == null) {
				return Promise.resolve(null);
			}
			return Promise.resolve(JSON.parse(value));
		}
		public serialize(value: IGroup | null): string | null {
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
	export let groupNames: string[];

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			console.log(controller.value);
			if (controller.value?.Items != null) {
				groupNames = Object.keys(controller.value?.Items);
			} else {
				groupNames = [];
			}

			controller.value = controller.value;
		}
	});
	beforeUpdate(async () => await component.setup(controller));

	export function move(item: IItem, currentGroupIndex: number, targetGroupIndex: number): void {
		let currentGroup = controller.value?.Items[groupNames[currentGroupIndex]];
		let targetGroup = controller.value?.Items[groupNames[targetGroupIndex]];

		if (currentGroup) {
			if (currentGroup.indexOf(item) !== -1) {
				currentGroup.splice(currentGroup.indexOf(item), 1);
			}
		}
		if (targetGroup) {
			targetGroup.push(item);
		}
		controller.value = controller.value;
	}
	export function moveAll(currentGroupIndex: number, targetGroupIndex: number): void {
		const currentGroup = controller.value?.Items[groupNames[currentGroupIndex]];
		const targetGroup = controller.value?.Items[groupNames[targetGroupIndex]];

		// Clear current group.
		if (currentGroup) {
			const currentGroupArray = controller.value?.Items[groupNames[currentGroupIndex]];
			if (currentGroupArray) {
				currentGroupArray.splice(0, currentGroupArray.length);
			}
		}

		// Append items to target group.
		if (currentGroup && targetGroup) {
			currentGroup.forEach((i) => {
				targetGroup.push(i);
			});
		}
		controller.value = controller.value;
	}
	function linkClick(item: IItem) {
		window.location.href = item.Link;
	}
</script>

{#if controller.value != null}
	<div class="form-input-groups">
		{#each Object.entries(controller.value.Items) as item, index}
			{#if item[index] === 'Not Assigned'}
				<div>
					<div>
						<h2>Not Assigned</h2>
					</div>
					<div>
						<button
							type="button"
							class="btn"
							on:click={() => moveAll(item.indexOf(item[index]), item.indexOf(item[index + 1]))}
						>
							<i class="fa-solid fa-arrow-right" />
						</button>
					</div>
					<ul>
						{#each item[1] as i}
							<li>
								<div>
									{i.Label}
									<button type="button" class="btn" on:click={() => linkClick(i)}>
										<i class="fa fa-external-link-alt fa-1x" />
									</button>
								</div>
								<div class="buttons">
									<button
										type="button"
										class="btn"
										on:click={() =>
											move(i, item.indexOf(item[index]), item.indexOf(item[index + 1]))}
									>
										<i class="fa-solid fa-arrow-right" />
									</button>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if item[index] != 'Not Assigned'}
				<div>
					<div>
						<button
							type="button"
							class="btn"
							on:click={() => moveAll(item.indexOf(item[index]), item.indexOf(item[index - 1]))}
						>
							<i class="fa-solid fa-arrow-left" />
						</button>
					</div>
					<div>
						<h2>Assigned</h2>
					</div>
					<ul>
						{#each item[1] as i}
							<li>
								<button
									type="button"
									class="btn"
									on:click={() => move(i, item.indexOf(item[index]), item.indexOf(item[index - 1]))}
								>
									<i class="fa-solid fa-arrow-left" />
								</button>
								{i.Label}
								<button type="button" class="btn" on:click={() => linkClick(i)}>
									<i class="fa fa-external-link-alt fa-1x" />
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/each}
	</div>
{/if}

<style lang="scss">
	.form-input-groups {
		align-content: stretch;
		align-items: stretch;
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
	}

	.form-input-groups > div {
		border: 1px solid #bfc6ce;
		border-width: 1px 1px 1px 0;
		flex-basis: 50%;
		flex-grow: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
	}

	.form-input-groups > div:first-child {
		border-width: 1px;
	}

	.form-input-groups > div > div {
		align-content: center;
		align-items: center;
		background: #2d3c4b;
		color: #fff;
		display: flex;
		flex-wrap: nowrap;
		font-weight: bold;
		justify-content: space-between;
		padding: 5px 16px 5px 5px;
	}

	.form-input-groups > div > div {
		padding: 10px;
	}

	.form-input-groups > div.group-name {
		flex-grow: 10;
		text-align: center;
	}

	.form-input-groups > div > ul {
		height: 300px;
		list-style: none inside;
		margin: 0;
		overflow-y: auto;
		padding: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.form-input-groups > div > ul > li {
		align-content: stretch;
		align-items: center;
		justify-content: space-between;
		display: flex;
		flex-wrap: nowrap;
		justify-content: left;
		padding: 0;
	}

	.form-input-groups > div > ul > li:hover {
		background: #f0f2f6;
	}

	.form-input-groups > div > ul > li > .item-label {
		flex-grow: 10;
		padding: 8px;
	}

	.last-group .fa-arrow-right {
		display: none !important;
	}

	.first-group .fa-arrow-left {
		display: none !important;
	}

	.form-input-groups .fa {
		cursor: pointer;
		padding: 10px;
	}

	.form-input-groups a.fa {
		padding: 0 5px !important;
		text-decoration: none;
	}
</style>
