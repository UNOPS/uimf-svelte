<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';

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
</script>

<script lang="ts">
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
