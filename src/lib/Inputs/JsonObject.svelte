<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';

	interface IJsonObject {
		Value: any;
	}

	export class Controller extends InputController<IJsonObject> {
		public getValue(): Promise<IJsonObject | null> {
			var result = this.value != null && this.value.Value != null ? this.value : null;

			return Promise.resolve(result);
		}

		public deserialize(value: string | null): Promise<IJsonObject | null> {
			if (value == null) {
				return Promise.resolve(null);
			}

			return Promise.resolve(JSON.parse(value));
		}

		public serialize(value: IJsonObject | null): string | null {
			return value == null || value.Value == null ? null : JSON.stringify(value.Value);
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