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
			CssClass?: string;
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

	class FlexboxController extends OutputController<any> {
		declare metadata: FlexboxMetadata;
	}

	class FlexboxItemController extends OutputController<any> {
		declare metadata: FlexboxItemMetadata;
	}

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
		class={controller.metadata.CustomProperties.CssClass ?? ''}
		style:gap={controller.metadata.CustomProperties.Gap ?? '5px'}
	>
		{#each fields as field}
			<div
				class={field.controller.metadata.CustomProperties?.Flexbox?.CssClass ?? ''}
				style:flex-basis={field.controller.metadata.CustomProperties?.Flexbox?.FlexBasis ?? 'auto'}
			>
				{#if field.controller.metadata.Label?.length > 0}
					<div class="title">
						{field.controller.metadata.Label}
					</div>
				{/if}
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.title {
		background-color: #218fcf;
		color: #fff;
		font-size: 1.2em;
		text-align: center;
		margin-top: -10px;
		height: 40px;
		padding-bottom: 5px;
	}

	.flex-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		flex-direction: row;
		justify-content: flex-start;
	}

	.boxed {
		border: 1px solid #b1b1b1;
		box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
	}
</style>
