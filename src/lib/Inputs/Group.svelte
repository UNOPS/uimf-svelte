<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	import { InputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';

	export class Controller extends InputController<string> {
		public getValue(): Promise<string | null> {
			return Promise.resolve(this.value != null && this.value.length > 0 ? this.value : null);
		}
		public deserialize(value: string | null): Promise<string | null> {
			return Promise.resolve(value);
		}
		public serialize(value: string | null): string | null {
			return value;
		}
	}

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<script lang="ts">
	let groupNames: string[] = [];
	let data = {
		value: null as any,
		init: function (value: { Items: {} } | null) {
			groupNames = value != null ? Object.keys(value.Items) : [];
			this.value = value;
		},
		getValue: function () {
			return this.value;
		},
		move: function (
			item: any,
			currentGroupIndex: string | number,
			targetGroupIndex: string | number
		) {
			let currentGroup = this.value.Items[groupNames[currentGroupIndex]];
			let targetGroup = this.value.Items[groupNames[targetGroupIndex]];
			let index = currentGroup.indexOf(item);
			if (index !== -1) {
				currentGroup.splice(index, 1);
			}
			targetGroup.push(item);
		},
		moveAll: function (currentGroupIndex, targetGroupIndex) {
			let currentGroup = this.value.Items[groupNames[currentGroupIndex]];
			let targetGroup = this.value.Items[groupNames[targetGroupIndex]];
			this.value.Items[groupNames[currentGroupIndex]] = [];
			currentGroup.forEach(function (i) {
				targetGroup.push(i);
			});
		},
		isLastGroup: function (groupIndex: number) {
			return groupIndex === groupNames.length - 1;
		}
	};
</script>

<div class="form-input-groups">
	<!-- svelte-ignore a11y-interactive-supports-focus -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-missing-content -->

	{#each Object.entries(data.value.Items) as [group, items], groupIndex}
		<div class:last-group={data.isLastGroup(groupIndex)} class:first-group={groupIndex === 0}>
			<div>
				<span
					class="fa fa-arrow-left"
					on:click={() => data.moveAll(groupIndex, groupIndex - 1)}
					on:keydown={() => data.moveAll(groupIndex, groupIndex - 1)}
					role="button"
				/>
				<span class="group-name">{group}</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span class="fa fa-arrow-right" on:click={() => data.moveAll(groupIndex, groupIndex + 1)} />
			</div>
			<ul>
				{#each items as i}
					<li>
						<span
							class="fa fa-arrow-left"
							on:click={() => data.move(i, groupIndex, groupIndex - 1)}
						/>
						<span class="item-label">
							{i.Label}
							{#if i.Link != null}
								<a href={i.Link.Url} class="fa fa-external-link-alt fa-1x" />
							{/if}
						</span>
						<span
							class="fa fa-arrow-right"
							on:click={() => data.move(i, groupIndex, groupIndex + 1)}
						/>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>

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
	}

	.form-input-groups > div:first-child {
		border-width: 1px;
	}

	.form-input-groups > div > div {
		align-content: stretch;
		align-items: stretch;
		background: #2d3c4b;
		color: #fff;
		display: flex;
		flex-wrap: nowrap;
		font-weight: bold;
		justify-content: space-between;
		padding-right: 16px;
	}

	.form-input-groups > div > div > span {
		padding: 10px;
	}

	.form-input-groups > div > div > span.group-name {
		flex-grow: 10;
		text-align: center;
	}

	.form-input-groups > div > ul {
		height: 300px;
		list-style: none inside;
		margin: 0;
		overflow-y: auto;
		padding: 0;
	}

	.form-input-groups > div > ul > li {
		align-content: stretch;
		align-items: center;
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
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
