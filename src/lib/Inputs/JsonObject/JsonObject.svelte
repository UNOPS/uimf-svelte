<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import { UrlSerializer } from '../../Infrastructure/Utilities/UrlSerializer';

	interface IJsonObject {
		Value: any;
	}

	export class Controller extends InputController<IJsonObject> {
		public getValue(): Promise<IJsonObject | null> {
			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<IJsonObject | null> {
			const innerValue = UrlSerializer.deserialize(value);
			return Promise.resolve({ Value: innerValue });
		}

		public serialize(value: IJsonObject | null): string | null {
			return UrlSerializer.serialize(value?.Value);
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
