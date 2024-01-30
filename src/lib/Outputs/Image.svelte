<script lang="ts" context="module">
	interface Image {
		Source: string;
		Width: string | null;
		Height: string | null;
		AltText: string | null;
		Url: string | null;
		Id: number | null;
		ShowDeleteButton: boolean | null;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<Image>;
	export let height: string | null;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	async function deleteImage(index: number | null) {
		if (index == null) {
			throw `Image index is missing.`;
		}
		type PostData = { Id: number };

		let postData: PostData = { Id: index };

		let response = controller.app
			.postForm('delete-product-image', postData, null)
			.then((response: any) => {
				if (response.Result == true) {
					controller.setValue({
						Source: '',
						Width: null,
						Height: null,
						AltText: null,
						Url: null,
						Id: null,
						ShowDeleteButton: false
					});
				}
			});

		await response;
	}

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<div class="image-container">
		{#if controller.value.Url != null}
			<a href={controller.value.Url}>
				<img
					class="output-image"
					style:width={controller.value.Width}
					style:height={height ?? controller.value.Height}
					src={controller.value.Source}
					alt={controller.value.AltText}
				/>
			</a>
		{:else}
			<img
				class="output-image"
				style:width={controller.value.Width}
				style:height={height ?? controller.value.Height}
				src={controller.value.Source}
				alt={controller.value.AltText}
			/>
		{/if}

		{#if controller.value.ShowDeleteButton}
			<button class="delete-button" on:click={() => deleteImage(controller.value.Id)}>
				<i class="fa-solid fa-trash-can" aria-hidden="true" />
			</button>
		{/if}
	</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.image-container {
		position: relative;
		display: inline-block;
	}

	.output-image {
		margin: 2px;
	}

	.delete-button {
		position: absolute;
		top: 2px;
		right: 2px;
		background-color: rgb(0, 140, 255);
		border: none;
		border-bottom-left-radius: 50%;
		padding: 4px 10px 4px 10px;
		cursor: pointer;
		color: white;
	}
</style>
