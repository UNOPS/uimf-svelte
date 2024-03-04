<script lang="ts" context="module">
	export interface SliderConfiguration {
		Item: IComponent;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent } from '$lib/Infrastructure/uimf';

	export let controller: OutputController<any, IFieldMetadata<SliderConfiguration>>;
	class ComponentController {
		index: number = 1;
		component: any;
		controller: any;
	}

	let componentItemControllers: ComponentController[] = [];
	let componentThumbnailControllers: ComponentController[] = [];

	function loadComponentControllers(items: any[]) {
		let nestedComponentType = controller.metadata.Component.Configuration.Item.Type;
		let nestedComponent = controlRegister.outputs[nestedComponentType].component;

		let i = 1;
		items.forEach((item) => {
			let itemController: ComponentController = {
				index: i,
				component: nestedComponent,
				controller: new OutputController<any>({
					metadata: {
						Component: controller.metadata.Component.Configuration.Item,
						Hidden: false,
						Id: Date.now().toString(),
						Label: '',
						OrderIndex: 0,
						Required: false
					},
					data: null,
					form: controller.form!,
					app: controller.app
				})
			};

			itemController.controller.setValue(item.m_Item1);
			componentItemControllers.push(itemController);

			if (item.m_Item2 != null) {
				let thumbnailController: ComponentController = {
					index: i,
					component: nestedComponent,
					controller: new OutputController<any>({
						metadata: controller.metadata,
						data: null,
						form: controller.form!,
						app: controller.app
					})
				};

				thumbnailController.controller.setValue(item.m_Item2);
				componentThumbnailControllers.push(thumbnailController);
			}

			i++;
		});
	}

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			if (controller.value != null) {
				loadComponentControllers(controller.value.Items);
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let currentIndex = 1;

	function nextSlide() {
		if (currentIndex < componentItemControllers.length) {
			currentIndex += 1;
		}
	}

	function prevSlide() {
		if (currentIndex > 1) {
			currentIndex -= 1;
		}
	}

	function goToSlide(number: number) {
		currentIndex = number;
	}

	if (controller.value != null) {
		loadComponentControllers(controller.value.Items);
	}

	// 400 is arbitrary value of the height for a slider with a width of 600px
	var dynamicHeight = 400 / componentItemControllers.length;

	if (dynamicHeight > 150) {
		dynamicHeight = 150;
	}
</script>

<div class="slider-container">
	{#if componentItemControllers != null && Array.isArray(componentItemControllers) && componentItemControllers.length > 0}
		<div class="caption-container">
			<button class="prev" on:click={prevSlide}>&#10094;</button>
			<div class="caption">
				<svelte:component
					this={componentItemControllers[currentIndex - 1].component}
					controller={componentItemControllers[currentIndex - 1].controller}
				/>
			</div>
			<button class="next" on:click={nextSlide}>&#10095;</button>
		</div>

		<div class="thumbnails-row">
			{#each componentThumbnailControllers as componentThumbnailController}
				<button on:click={() => goToSlide(componentThumbnailController.index)}>
					<div class="thumbnail">
						<svelte:component
							this={componentThumbnailController.component}
							controller={componentThumbnailController.controller}
							height="{dynamicHeight}px"
						/>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	button {
		padding: 0px;
		background-color: transparent;
		cursor: pointer;
		border: none;
	}

	.slider-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin: 10px auto;
	}

	.caption-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5px 15px;
		color: rgb(97, 97, 97);
		height: 400px;
		overflow: hidden;
	}

	.caption {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5px 15px;
		width: 600px;
		overflow: hidden;
	}

	.prev,
	.next {
		cursor: pointer;
		width: auto;
		font-weight: bold;
		font-size: 2rem;
		margin: 30px;
	}

	.prev:hover,
	.next:hover {
		color: rgb(83, 172, 255);
		text-decoration: none;
	}

	.prev:active,
	.next:active {
		color: rgb(83, 172, 255);
		text-decoration: none;
	}

	.thumbnails-row {
		width: auto;
		display: flex;
		align-self: center;
		max-height: 100px;
	}

	.thumbnail {
		display: flex;
		height: inherit;
	}
</style>
