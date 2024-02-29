<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	interface FlexboxMetadata extends ComponentMetadata {
		CustomProperties: {
			Fields: FlexboxItemMetadata[];
			Gap?: string;
			Wrap?: string;
			CssClass?: string;
			ItemPadding?: string;
			JustifyContent?: string;
		};
	}

	interface FlexboxItem {
		component: any;
		controller: FlexboxItemController;
	}

	interface FlexboxItemMetadata extends ComponentMetadata {
		CustomProperties?: {
			Flexbox?: {
				FlexBasis?: string;
				CssClass?: string;
			};
		};
	}

	class FlexboxController extends OutputController<any, FlexboxMetadata> {}

	class FlexboxItemController extends OutputController<any, FlexboxItemMetadata> {}

	export let controller: FlexboxController;

	let fields: FlexboxItem[];

	let component = new OutputComponent({
		refresh() {
			fields = getComponentControllers();

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(): FlexboxItem[] {
		if (controller.value?.Value == null) {
			return [];
		}

		return controller.metadata.CustomProperties.Fields.sort(
			(a, b) => a.OrderIndex - b.OrderIndex
		).map((item) => {
			const field = controlRegister.createOutput({
				metadata: item,
				app: controller.app,
				form: controller.form,
				data: null
			});

			if (controller.value?.Value != null) {
				field.controller.setValue(controller.value?.Value[item.Id]);
			}

			return field;
		});
	}
</script>

{#if fields?.length > 0}
	<div
		class:flex-container={true}
		class={controller.metadata.CustomProperties.CssClass}
		style:gap={controller.metadata.CustomProperties.Gap}
		style:flex-wrap={controller.metadata.CustomProperties.Wrap}
		style:justify-content={controller.metadata.CustomProperties.JustifyContent}
	>
		{#each fields as field}
			<div
				class={field.controller.metadata.CustomProperties?.Flexbox?.CssClass}
				style:flex-basis={field.controller.metadata.CustomProperties?.Flexbox?.FlexBasis}
				style:padding={controller.metadata.CustomProperties.ItemPadding}
			>
				{#if field.controller.metadata.Label?.length > 0}
					<h3>{field.controller.metadata.Label}</h3>
				{/if}
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	h3 {
		padding: 5px 10px;
		border-bottom: 2px solid #cbdce9;
		font-weight: 400;
		font-size: 1.1em;
	}

	.flex-container {
		display: flex;
		width: 100%;
	}

	.boxed {
		background-color: #ffffff;
		border: 1px solid #d1d1d1;
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
		height: fit-content;
	}

	.height700{
		height: 750px;
	}
</style>
