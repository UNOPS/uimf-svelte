<script lang="ts" context="module">
	interface Configuration {
		Formatted?: boolean;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IFieldMetadata } from '$lib../../Infrastructure/uimf';

	export let controller: OutputController<number, IFieldMetadata<Configuration>>;
	let displayValue: string | null = null;

	let component = new OutputComponent({
		refresh() {
			if (controller.value != null) {
				if (controller.metadata.Component?.Configuration?.Formatted) {
					displayValue = new Intl.NumberFormat().format(controller.value);
				} else {
					displayValue = controller.value.toString();
				}
			} else {
				displayValue = null;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if displayValue != null}
	{displayValue}
{/if}
