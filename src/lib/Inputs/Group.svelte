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
</script>

{#if controller.value != null}
	<div class="form-input-groups">
		{#each Object.entries(controller.value.Items) as item, index}
			{#if item[index] === 'Not Assigned'}
				<div id="first-group">
					<div>
						<h2 class="group-name">Not Assigned</h2>
						<i class="fa-solid fa-arrow-right" />
					</div>
					<ul>
						{#each item[1] as i}
							<li>
								{i.Label}
								<i class="fa fa-external-link-alt fa-1x" />
								<div class="buttons">
									<button
										type="button"
										class="btn btn-danger remove-button"
										on:click={() => {
											//moveTo. = '';
											controller.setValue(null);
										}}
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
				<div id="last-group">
					<div>
						<i class="fa-solid fa-arrow-left" />
						<h2 class="group-name">Assigned</h2>
					</div>
					<ul>
						{#each item[1] as i}
							<li>
								<i class="fa-solid fa-arrow-left" />
								{i.Label}
								<i class="fa fa-external-link-alt fa-1x" />
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
	}

	.form-input-groups > div > ul > li {
		align-content: stretch;
		align-items: center;
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
