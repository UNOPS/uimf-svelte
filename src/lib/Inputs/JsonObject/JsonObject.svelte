<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';

	interface IJsonObject {
		Value: any;
	}

	export class Controller extends InputController<IJsonObject> {
		public getValue(): Promise<IJsonObject | null> {
			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<IJsonObject | null> {
			// Deserialize the inner value and then wrap it.
			const innerValue = value == null ? null : JSON.parse(value);
			return Promise.resolve({ Value: innerValue });
		}

		public serialize(value: IJsonObject | null): string | null {
			// Serialize the inner value.
			return value?.Value != null ? JSON.stringify(value.Value) : null;
		}
	}
</script>

<script lang="ts">
	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>
