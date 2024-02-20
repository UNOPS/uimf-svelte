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
	let groupNames: string[];

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			if (controller.value?.Items != null) {
				groupNames = Object.keys(controller.value?.Items);
			} else {
				groupNames = [];
			}

			controller.value = controller.value;
		}
	});
	beforeUpdate(async () => await component.setup(controller));

	function move(item: IItem, currentGroupIndex: number, targetGroupIndex: number): void {
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
	function moveAll(currentGroupIndex: number, targetGroupIndex: number): void {
		const currentGroup = controller.value?.Items[groupNames[currentGroupIndex]];
		const targetGroup = controller.value?.Items[groupNames[targetGroupIndex]];

		if (currentGroup) {
			const currentGroupArray = controller.value?.Items[groupNames[currentGroupIndex]];
			if (currentGroupArray) {
				currentGroup.forEach((i) => {
					targetGroup?.push(i);
				});
				currentGroupArray.splice(0, currentGroupArray.length);
			}
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
						<span>
							<h6>Not Assigned</h6>
						</span>
						<span>
							<button
								type="button"
								class="btn"
								on:click={() => moveAll(item.indexOf(item[index]), item.indexOf(item[index + 1]))}
							>
								<i class="fa fa-solid fa-arrow-right" />
							</button>
						</span>
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
										<i class="fa fa-solid fa-arrow-right" />
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
						<span>
							<button
								type="button"
								class="btn"
								on:click={() => moveAll(item.indexOf(item[index]), item.indexOf(item[index - 1]))}
							>
								<i class="fa fa-solid fa-arrow-left" />
							</button>
						</span>
						<span>
							<h6>Assigned</h6>
						</span>
					</div>

					<ul>
						{#each item[1] as i}
							<li>
								<div>
									<button
										type="button"
										class="btn"
										on:click={() =>
											move(i, item.indexOf(item[index]), item.indexOf(item[index - 1]))}
									>
										<i class="fa fa-solid fa-arrow-left" />
									</button>
									{i.Label}
									<button type="button" class="btn" on:click={() => linkClick(i)}>
										<i class="fa fa-external-link-alt fa-1x" />
									</button>
								</div>
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
		display: flex;
		justify-content: space-between;
	}

	.form-input-groups > div {
		border: 1px solid #bfc6ce;
		border-width: 1px 1px 1px 0;
		align-items: center;
	}

	.form-input-groups > div:first-child {
		border-width: 1px;
	}
	.form-input-groups > div > div > span {
		display: grid;
		align-content: center;
		background: #2d3c4b;
		color: #fff;
		font-weight: bold;
		padding: 0px 10px 0px 0px;
	}
	.form-input-groups > div > div > span > h6 {
		padding: 10px;
		display: flex;
		justify-content: space-between;
	}

	.form-input-groups > div > ul {
		height: 300px;
		list-style-type: none;
		padding-left: 10px;
		overflow-y: auto;
	}

	.form-input-groups > div > ul > li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-spacing: 2px;
		border-bottom: 1px solid #eee;
	}

	.form-input-groups > div > ul > li:hover {
		background: #f0f2f6;
	}

	.form-input-groups > div > ul > li > .item-label {
		flex-grow: 10;
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
