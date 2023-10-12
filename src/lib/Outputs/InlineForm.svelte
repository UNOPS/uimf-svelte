<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import UimfForm from '../Form.svelte';
	import { FormController } from '../Infrastructure/FormController';

	interface FormData {
		Form: string;
		InputFieldValues: any[];
	}

	export let controller: OutputController<FormData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let formController: FormController | null = null;

	controller.app.getForm(controller.value.Form).then((form) => {
		formController = new FormController(controller.form, form);
	});
</script>

{#if formController != null}
	<UimfForm controller={formController} />
{/if}
