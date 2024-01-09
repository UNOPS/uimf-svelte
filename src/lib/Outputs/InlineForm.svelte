<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	interface FormData {
		Form: string;
		InputFieldValues: any[];
	}

	export let controller: OutputController<FormData>;
	let container: Element;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			if (controller.value != null) {
				var el = controller.app.renderForm({
					data: controller.value,
					metadata: controller.metadata,
					form: controller.form
				});

				container.appendChild(el);
			} else {
				container.replaceChildren();
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div bind:this={container} />
