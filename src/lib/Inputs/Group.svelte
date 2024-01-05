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
	<div>
		{#each Object.entries(controller.value.Items) as item}
			<h2>{item[0]}</h2>
			<ul>
				{#each item[1] as i}
					<li>{i.Label}</li>
				{/each}
			</ul>
		{/each}
	</div>
{/if}
