<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	interface OutputField {
		component: any;
		controller: any;
	}

	interface FlexboxMetadata extends ComponentMetadata {
		CustomProperties: {
			Fields: ComponentMetadata[];
			Customizations: {
				FlexBasis: string;
				Margin: string;
				Style: string;
			};
		};
	}

	class FlexboxController extends OutputController<any> {
		declare metadata: FlexboxMetadata;
	}

	export let controller: FlexboxController;

	let fields: OutputField[];

	let component = new OutputComponent({
		refresh() {
			fields = getComponentControllers();
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

	let flexBasisArray: string[] =
		controller.metadata.CustomProperties.Customizations.FlexBasis.split(' ');
	let flexBasisCount: number = flexBasisArray.length;

	function asEffectiveValue(rawFlexBasis: string, margin: string): string {
		//Check that flex-basis value is a %
		if (rawFlexBasis.includes('px')) {
			return rawFlexBasis;
		}

		let marginValue = parseInt(margin.replace('px', ''));
		let flexBasisValue = parseInt(rawFlexBasis.replace('%', ''));

		// Default screen resolution is 1080p (1920 x 1080 pixels)
		let width = (1920 * flexBasisValue) / 100 - marginValue * 2;

		return width + 'px';
	}
</script>

{#if fields?.length > 0}
	<div class="flex-container">
		{#each fields as field, index}
			<div
				class="flex-item {controller.metadata.CustomProperties.Customizations.Style}"
				style:flex-basis={asEffectiveValue(
					flexBasisArray[index % flexBasisCount],
					controller.metadata.CustomProperties.Customizations.Margin
				)}
				style:margin={controller.metadata.CustomProperties.Customizations.Margin}
			>
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
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
