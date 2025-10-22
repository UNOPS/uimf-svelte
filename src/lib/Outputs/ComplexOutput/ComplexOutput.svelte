<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import type { ILayout } from '../../Components/Layout/Metadata/ILayout';
	import type { LayoutViewData, LayoutInstance } from '../../Components/Layout/Layout.svelte';
	import { LayoutUtils } from '../../Components/Layout/LayoutUtils';
	import Layout from '../../Components/Layout/Layout.svelte';

	class Controller extends OutputController<LayoutViewData, IOutputFieldMetadata<ILayout>> {}

	export let controller: Controller;

	let layout: LayoutInstance;

	let component = new OutputComponent({
		refresh() {
			layout = LayoutUtils.buildLayout(controller);
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-output={true}>
	<Layout {layout} />
</div>
