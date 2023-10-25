<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	interface OutputField {
		component: any;
		controller: FlexboxController;
	}

	interface FlexboxMetadata extends ComponentMetadata {
		CustomProperties: {
			Fields: ComponentMetadata[];
			Customizations: {
				FlexBasis: string;
				Margin: string;
				CssClass: string;
			};
		};
	}

	class FlexboxController extends OutputController<any> {
		declare metadata: FlexboxMetadata;
	}

	export let controller: FlexboxController;

	let fields: OutputField[];
	let parentWidth = 0;
	let parentElement: HTMLDivElement;

	let component = new OutputComponent({
		refresh() {
			fields = getComponentControllers();

			if (parentElement) {
				parentWidth = parentElement.getBoundingClientRect().width;
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(): OutputField[] {
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

	function asEffectiveValue(rawFlexBasis: string, margin: string): string {
		//Check that flex-basis value is a %
		if (rawFlexBasis.includes('px')) {
			return rawFlexBasis;
		}

		let marginValue = parseInt(margin.replace('px', ''));
		let flexBasisValue = parseInt(rawFlexBasis.replace('%', ''));

		// Calculate width based on the parent element's width
		let width = (parentWidth * flexBasisValue) / 100 - marginValue * 2;

		return width + 'px';
	}
</script>

{#if fields?.length > 0}
	<div bind:this={parentElement} class="flex-container">
		{#each fields as field}
			<div
				class="flex-item {field.controller.metadata.CustomProperties.Customizations.CssClass}"
				style:flex-basis={asEffectiveValue(
					field.controller.metadata.CustomProperties.Customizations.FlexBasis,
					field.controller.metadata.CustomProperties.Customizations.Margin
				)}
				style:margin={field.controller.metadata.CustomProperties.Customizations.Margin}
			>
				<div class="title">
					{field.controller.metadata.Label}
				</div>
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.title {
		background-color: #218FCF;
		color: #fff;
		font-size: 1.2em;
		text-align: center;
		margin-top: -10px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 5px;
	}

	.flex-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		flex-direction: row;
	}

	.flex-item {
		padding-top: 10px;
		padding-bottom: 15px;
		display: flex;
		justify-content: left;
		flex-direction: column;
	}

	.boxed {
		border: 1px solid #b1b1b1;
		box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
	}
</style>
