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


<div class="form-input-groups">
    {#each Object.entries(data.value.Items) as [group, items], index (groupIndex)}
        <div class="{last-group: isLastGroup(groupIndex), first-group: groupIndex === 0}" bind:groupIndex>
            <div>
                <span class="fa fa-arrow-left" on:click={() => moveAll(groupIndex, groupIndex - 1)}></span>
                <span class="group-name">{group}</span>
                <span class="fa fa-arrow-right" on:click={() => moveAll(groupIndex, groupIndex + 1)}></span>
            </div>
            <ul>
                {#each items as i (i.Label)}
                    <li>
                        <span class="fa fa-arrow-left" on:click={() => move(i, groupIndex, groupIndex - 1)}></span>
                        <span class="item-label">
                            {i.Label}
                            {#if i.Link != null}
                                <a href={i.Link.Url} class="fa fa-external-link-alt fa-1x"></a>
                            {/if}
                        </span>
                        <span class="fa fa-arrow-right" on:click={() => move(i, groupIndex, groupIndex + 1)}></span>
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
