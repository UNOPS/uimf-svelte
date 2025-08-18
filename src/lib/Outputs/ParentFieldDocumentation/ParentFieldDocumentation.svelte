<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import type { Field } from '../../Infrastructure/Fields/Field';

	interface IData {
		Value: string | null;
	}

	interface IConfiguration {
		ParentLevel: number;
	}

	export let controller: OutputController<IData, IOutputFieldMetadata<IConfiguration>>;

	let documentation: string | null = null;

	let component = new OutputComponent({
		refresh() {
			documentation = controller.value?.Value;

			if (documentation == null) {
				const parentLevel = controller.metadata.Component.Configuration.ParentLevel;

				let currentLevel = 0;
				let currentController: Field | null = controller;

				while (currentLevel < parentLevel && currentController != null) {
					currentController = currentController.parent;
					currentLevel++;
				}

				documentation = currentController?.metadata.Documentation ?? null;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if documentation != null && documentation.length > 0}
	<div class="alert alert-info">{@html documentation}</div>
{/if}
