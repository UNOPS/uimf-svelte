<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';

	class OutputField {
		component: any;
		controller: any;
	}

	export let controller: OutputController<any>;

	let fields: OutputField[];

	let component = new OutputComponentController({
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

		return (controller.metadata.CustomProperties.Properties as any[])
			.sort((a, b) => a.OrderIndex - b.OrderIndex)
			.map((property) => {
				const entry = controlRegister.outputs[property.Type];

				if (entry == null) {
					throw `No component available for output of type "${property.Type}".`;
				}

				let field = {
					component: entry.component,
					controller: new OutputController<any>({
						metadata: property,
						data: null,
						form: controller.form,
						app: controller.app
					})
				};

				if (controller.value?.Value != null) {
					field.controller.setValue(controller.value?.Value[property.Id]);
				}

				return field;
			});
	}
</script>

{#if fields?.length > 0}
	<div class={controller.metadata.CustomProperties?.cssClass}>
		{#each fields as field}
			<div class={field.controller.metadata.CustomProperties?.cssClass}>
				<svelte:component
					this={field.component}
					controller={field.controller}
				/>
			</div>
		{/each}
	</div>
{/if}

<style>
	/* Layout parent class that must be applied on the parent component */
	.layout-container {
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: 25% 75%;
		height: 100%;
	}

	.layout-container.size35-65 {
		grid-template-columns: 35% 65% !important;
	}

	/* set a sub classes to be applied on child component/element */
	.layout-left {
		grid-row: 1;
		grid-column: 1;
		padding: 5px;
		margin: 5px;
	}

	.layout-right {
		grid-row: 1;
		grid-column: 2;
		padding: 5px;
		margin: 5px;
	}

	.layout-lower-half {
		grid-row: 2;
		grid-column: 1 / span 2;
		padding: 5px;
		margin: 5px;
	}

	.new-line {
		margin-bottom: 10px;
	}

	.small-font {
		font-size: 14px;
	}
</style>
