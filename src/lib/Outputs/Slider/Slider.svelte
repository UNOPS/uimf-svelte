<script lang="ts" context="module">
	export interface SliderConfiguration {
		Item: IComponent;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IComponent, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';

	export let controller: OutputController<any, IOutputFieldMetadata<SliderConfiguration>>;

	class ComponentController {
		index: number = 1;
		component: any;
		controller: any;
	}

	let componentItemControllers: ComponentController[] = [];
	let componentThumbnailControllers: ComponentController[] = [];

	function loadComponentControllers(items: any[]) {
		componentItemControllers = [];
		componentThumbnailControllers = [];

		let nestedComponentType = controller.metadata.Component.Configuration.Item.Type;
		let nestedComponent = controlRegister.outputs[nestedComponentType].component;

		items.forEach((item, i) => {
			let index = i + 1;
			let itemController: ComponentController = {
				index,
				component: nestedComponent,
				controller: new OutputController<any>({
					metadata: OutputFieldMetadataFactory.fromComponent(
						controller.metadata.Component.Configuration.Item
					),
					data: null,
					form: controller.form!,
					app: controller.app,
					parent: controller
				})
			};

			itemController.controller.setValue(item.m_Item1);
			componentItemControllers.push(itemController);

			if (item.m_Item2 != null) {
				let thumbnailController: ComponentController = {
					index,
					component: nestedComponent,
					controller: new OutputController<any>({
						metadata: controller.metadata,
						data: null,
						form: controller.form!,
						app: controller.app,
						parent: controller
					})
				};

				thumbnailController.controller.setValue(item.m_Item2);
				componentThumbnailControllers.push(thumbnailController);
			}
		});
	}

	let component = new OutputComponent({
		refresh() {
			if (controller.value?.Items?.length) {
				loadComponentControllers(controller.value.Items);
			}
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	$: if (controller.value?.Items?.length && componentItemControllers.length === 0) {
		loadComponentControllers(controller.value.Items);
	}

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

	// Adjust height dynamically based on number of items
	$: dynamicHeight =
		componentItemControllers.length > 0 ? Math.min(80, 400 / componentItemControllers.length) : 80;
</script>

<div class="slider-container">
	{#if controller.value != null}
		{#if componentItemControllers != null}
			{#if Array.isArray(componentItemControllers)}
				{#if componentItemControllers.length === 0}
					<div class="m-5 p-5">No picture</div>
				{/if}
			{/if}
		{/if}

		{#if componentItemControllers.length > 0}
			<div class="caption-container">
				<button
					class="prev"
					on:click={prevSlide}
					style="visibility: {currentIndex > 1 ? 'visible' : 'hidden'}"
				>
					&#10094;
				</button>
				<div class="caption">
					<svelte:component
						this={componentItemControllers[currentIndex - 1].component}
						controller={componentItemControllers[currentIndex - 1].controller}
					/>
				</div>
				<button
					class="next"
					on:click={nextSlide}
					style="visibility: {currentIndex < componentItemControllers.length
						? 'visible'
						: 'hidden'}"
				>
					&#10095;
				</button>
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
		color: #ccc;
		height: 400px;
		overflow: hidden;
	}

	.caption {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5px 15px;
		width: 500px;
		overflow: hidden;
	}

	.prev,
	.next {
		cursor: pointer;
		width: auto;
		font-size: 3rem;
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
		max-height: 80px;
	}

	.thumbnail {
		display: flex;
		height: inherit;
	}
</style>
