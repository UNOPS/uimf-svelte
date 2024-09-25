<script lang="ts">
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';

	interface Configuration {
		Properties: IFieldMetadata[];
	}

	class ComponentController {
		component: any;
		controller: any;
	}

	const handleClick = (tabValue: number) => () => (activeTabValue = tabValue);

	export let controller: OutputController<any, IFieldMetadata<Configuration>>;

	let component = new OutputComponent({
		refresh() {
			tabs = getComponentControllers(controller.metadata.Component.Configuration.Properties);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let tabs: any[] = getComponentControllers(controller.metadata.Component.Configuration.Properties);
	export let activeTabValue = tabs[0].controller.metadata.Id;

	function getComponentControllers(properties: IFieldMetadata[]): any[] {
		let componentControllerArray: ComponentController[] = [];

		properties.forEach((property) => {
			let componentController = {
				component: controlRegister.outputs[property.Component.Type].component,
				controller: new OutputController<any>({
					metadata: property,
					data: null,
					form: controller.form!,
					app: controller.app,
					parent: controller
				})
			};

			componentController.controller.setValue(controller.value?.Value[property.Id] || {});
			componentControllerArray.push(componentController);
		});

		return componentControllerArray;
	}
</script>

<ul>
	{#each tabs as tab}
		<li class={activeTabValue === tab.controller.metadata.Id ? 'active' : ''}>
			<span
				on:click={handleClick(tab.controller.metadata.Id)}
				on:keydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						handleClick(tab.controller.metadata.Id)();
					}
				}}
				tabindex="0"
				role="button"
				aria-label={`Switch to ${tab.controller.metadata.Label}`}
				>{tab.controller.metadata.Label}</span
			>
		</li>
	{/each}
</ul>
{#each tabs as tab}
	{#if activeTabValue == tab.controller.metadata.Id}
		<div class="box">
			<svelte:component this={tab.component} controller={tab.controller} />
		</div>
	{/if}
{/each}

<style>
	.box {
		margin-bottom: 10px;
		padding: 40px;
		border: 1px solid #dee2e6;
		border-radius: 0 0 0.5rem 0.5rem;
		border-top: 0;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		padding-left: 0;
		margin-bottom: 0;
		list-style: none;
		border-bottom: 1px solid #dee2e6;
	}
	li {
		margin-bottom: -1px;
	}

	span {
		border: 1px solid transparent;
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
		display: block;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	span:hover {
		border-color: #e9ecef #e9ecef #dee2e6;
	}

	li.active > span {
		color: #495057;
		background-color: #fff;
		border-color: #dee2e6 #dee2e6 #fff;
	}
</style>
