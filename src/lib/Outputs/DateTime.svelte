<script lang="ts" context="module">
	export interface DateTimeMetadata extends ComponentMetadata {
		HideTime: boolean;
	}

	export class DateTimeController extends OutputController<string> {
		declare metadata: DateTimeMetadata;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import type { ComponentMetadata } from '../Infrastructure/uimf';

	export let controller: DateTimeController;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	let options = controller.metadata.HideTime
		? {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
		  }
		: {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
		  };

	let valueAsString =
		controller.value != null
			? new Date(controller.value).toLocaleDateString('en-GB', options)
			: null;

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if valueAsString != null}
	{valueAsString}
{/if}

<style lang="scss">
	span.code-panel {
		display: block;
		padding: 20px 15px;
		clear: both;
		background: #f5f5f5;
		border-radius: 3px;
		border: 1px solid #e9e9e9;
	}

	.img-sm img {
		max-width: 100%;
		width: 250px;
	}
</style>
