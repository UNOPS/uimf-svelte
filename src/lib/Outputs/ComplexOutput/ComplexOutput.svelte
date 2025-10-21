<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import type {
		IComplexLayout,
		ComplexLayoutViewData,
		ComplexLayoutInstance
	} from '../../Components/ComplexLayout/ComplexLayout.svelte';
	import { ComplexLayoutUtils } from '../../Components/ComplexLayout/ComplexLayoutUtils';
	import ComplexLayout from '../../Components/ComplexLayout/ComplexLayout.svelte';

	class Controller extends OutputController<
		ComplexLayoutViewData,
		IOutputFieldMetadata<IComplexLayout>
	> {}

	export let controller: Controller;

	let layout: ComplexLayoutInstance;

	let component = new OutputComponent({
		refresh() {
			layout = ComplexLayoutUtils.buildLayout(controller);
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-output={true}>
	<ComplexLayout {layout} />
</div>
