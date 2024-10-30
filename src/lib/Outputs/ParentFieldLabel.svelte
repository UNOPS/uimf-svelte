<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';

	interface IData {
		Value: string | null;
	}

	interface IConfiguration {
		ParentLevel: number;
	}

	export let controller: OutputController<IData, IOutputFieldMetadata<IConfiguration>>;

	let label: string | null = null;

	let component = new OutputComponent({
		refresh() {
			label = controller.value?.Value;

			if (label == null) {
				const parentLevel = controller.metadata.Component.Configuration.ParentLevel;

				let currentLevel = 0;
				let currentController: OutputController<any> | null = controller;

				while (currentLevel < parentLevel && currentController != null) {
					currentController = currentController.parent;
					currentLevel++;
				}

				label = currentController?.metadata.Label ?? null;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if label != null && label.length > 0}
	{@html label}
{/if}
