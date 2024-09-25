<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import { OutputController } from '../Infrastructure/OutputController';
	import FormLink, { FormLinkData } from './FormLink.svelte';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';
	import type { Controller } from '../Outputs/FormLink.svelte';

	interface BreadcrumbsData {
		Path: FormLinkData[];
	}

	export let controller: OutputController<BreadcrumbsData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>({
			metadata: {} as IOutputFieldMetadata,
			data: value,
			form: controller.form!,
			app: controller.app,
			parent: controller
		}) as Controller;
	};
</script>

{#if controller.value?.Path?.length > 0}
	<nav>
		<ol class="breadcrumb">
			{#each controller.value.Path as link}
				<li class="breadcrumb-item active">
					<FormLink controller={makeController(link)} />
				</li>
			{/each}
		</ol>
	</nav>
{/if}
