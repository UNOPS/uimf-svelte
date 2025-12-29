<script lang="ts" context="module">
	export interface SliderConfiguration {
		Item: IComponent;
		Height?: string;
	}

	interface SliderData {
		Items: {
			Main: any;
			Thumbnail: any | null;
		}[];
	}

	interface SliderItemInstance {
		component: any;
		controller: OutputController<any>;
	}

	interface Item {
		Index: number;
		Main: SliderItemInstance;
		Thumbnail: SliderItemInstance | null;
	}

	type SliderController = OutputController<SliderData, IOutputFieldMetadata<SliderConfiguration>>;

	async function buildItemControllers(controller: SliderController): Promise<Item[]> {
		const itemCount = controller.value?.Items?.length ?? 0;

		if (itemCount == 0) {
			return Promise.resolve([]);
		}

		let items: Item[] = [];

		let componentType = controller.metadata.Component.Configuration.Item.Type;
		let component = controlRegister.outputs[componentType].component;

		let promises: Promise<void>[] = [];

		controller.value.Items.forEach(async (item, i) => {
			let toAdd: Item = {
				Index: i,
				Main: {
					component: component,
					controller: new OutputController<any>({
						metadata: OutputFieldMetadataFactory.fromComponent(
							controller.metadata.Component.Configuration.Item
						),
						data: null,
						form: controller.form!,
						app: controller.app,
						parent: controller
					})
				},
				Thumbnail:
					item.Thumbnail != null
						? {
								component: component,
								controller: new OutputController<any>({
									metadata: controller.metadata,
									data: null,
									form: controller.form!,
									app: controller.app,
									parent: controller
								})
						  }
						: null
			};

			promises.push(toAdd.Main.controller.setValue(item.Main));

			if (toAdd.Thumbnail != null) {
				promises.push(toAdd.Thumbnail?.controller.setValue(item.Thumbnail));
			}

			items.push(toAdd);
		});

		await Promise.all(promises);

		return items;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IComponent, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';

	export let controller: SliderController;

	let items: Item[] = [];
	let currentIndex = 0;

	let component = new OutputComponent({
		async refresh() {
			items = await buildItemControllers(controller);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	function gotoNext() {
		if (currentIndex < items.length - 1) {
			currentIndex += 1;
		}
	}

	function gotoPrevious() {
		if (currentIndex > 0) {
			currentIndex -= 1;
		}
	}

	function gotoIndex(number: number) {
		currentIndex = number;
	}
</script>

{#if items?.length > 0}
	<div class="ui-slider">
		<div class="ui-slider_main">
			<button on:click={gotoPrevious} style:visibility={currentIndex > 0 ? 'visible' : 'hidden'}>
				&#10094;
			</button>
			<div
				class="ui-slider_main-view"
				style:height={controller.metadata.Component.Configuration.Height}
			>
				<svelte:component
					this={items[currentIndex].Main.component}
					controller={items[currentIndex].Main.controller}
				/>
			</div>
			<button
				on:click={gotoNext}
				style:visibility={currentIndex < items.length - 1 ? 'visible' : 'hidden'}
			>
				&#10095;
			</button>
		</div>

		<div class="ui-slider_thumbnails">
			{#each items as item}
				{#if item.Thumbnail != null}
					<button on:click={() => gotoIndex(item.Index)}>
						<svelte:component
							this={item.Thumbnail.component}
							controller={item.Thumbnail.controller}
						/>
					</button>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<style>
	button {
		padding: 0px;
		background-color: transparent;
		cursor: pointer;
		border: none;
	}

	.ui-slider_main {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		padding: 5px 15px;
		color: #ccc;
		overflow: hidden;

		& > button {
			cursor: pointer;
			width: auto;
			font-size: 3rem;
			margin: 30px;

			&:active {
				color: rgb(83, 172, 255);
				text-decoration: none;
			}

			&:hover {
				color: rgb(83, 172, 255);
				text-decoration: none;
			}
		}
	}

	.ui-slider_thumbnails {
		display: flex;
		justify-content: center;
		gap: 2px;
		flex-wrap: wrap;
	}
</style>
