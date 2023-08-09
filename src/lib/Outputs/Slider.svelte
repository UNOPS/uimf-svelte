<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';

	export let controller: OutputController<any>;
	class ComponentController {
		index: number = 1;
		component: any;
		controller: any;
	}

	function loadComponentControllers(items: any[]) {
		let nestedComponentType = controller.metadata.CustomProperties.ItemTypes.Type;
		let nestedComponent = controlRegister.outputs[nestedComponentType].component;

		let i = 1;
		items.forEach((item) => {
			let ItemController = {
				index: i,
				component: nestedComponent,
				controller: new OutputController<any>(
					controller.metadata,
					null,
					controller.form,
					controller.app
				)
			};

			ItemController.controller.setValue(item.m_Item1);
			componentControllers.push(ItemController);

			if (item.m_Item2 != null) {
				let thumbnailController = {
					index: i,
					component: nestedComponent,
					controller: new OutputController<any>(
						controller.metadata,
						null,
						controller.form,
						controller.app
					)
				};

				thumbnailController.controller.setValue(item.m_Item2);
				componentThumbnailControllers.push(thumbnailController);
			}

			i++;
		});
	}

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let currentIndex = 1;

	function nextSlide() {
		if (currentIndex < componentControllers.length) {
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

	let componentControllers: ComponentController[] = [];
	let componentThumbnailControllers: ComponentController[] = [];

	loadComponentControllers(controller.value.Items);
</script>

<div class="slider-container">
	{#if componentControllers != null && componentControllers.length > 0 }
		<div class="caption-container">
			<button class="prev" on:click={prevSlide}>&#10094;</button>
			<div class="caption">
				<svelte:component
					this={componentControllers[currentIndex - 1].component}
					controller={componentControllers[currentIndex - 1].controller}
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
		height: 100px;
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
		height: 100px;
		width: auto;
		display: flex;
		align-self: center;
	}

	.thumbnail {
		display: flex;
		height: inherit;
	}
</style>
