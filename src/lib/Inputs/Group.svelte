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
	import getItems from 'svelte-select/get-items';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			console.log(controller);
			console.log(controller.metadata);
			console.log(controller.value);
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
	let runOnce = true;
</script>

{#if controller.value != null}
	<div class="form-input-groups">
		{#each Object.entries(controller.value.Items) as item}
			<div>
				<span>
					<h2>{item[0]}</h2>
				</span>
				<ul>
					{#each item[1] as i}
						<li>{i.Label}</li>
					{/each}
				</ul>
			</div>
			{#if runOnce}
				<span class="fa-solid fa-circle-arrow-left" />
				<span class="fa-solid fa-circle-arrow-right" />
				<script>
					$: runOnce = false;
				</script>
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
	}

	.form-input-groups > div:first-child {
		border-width: 1px;
	}

	.form-input-groups > div > span {
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

	.form-input-groups > div > span {
		padding: 10px;
	}

	.form-input-groups > span.group-name {
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
