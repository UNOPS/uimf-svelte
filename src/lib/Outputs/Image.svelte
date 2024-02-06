<script lang="ts" context="module">
	interface Image {
		Source: string;
		Width: string | null;
		Height: string | null;
		AltText: string | null;
		Url: string | null;
		Id: number | null;
		ShowMenu: boolean | null;
		IsActivated: boolean | null;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<Image>;
	export let height: string | null;

	let isMenuOpen: boolean;

	let component = new OutputComponent({
		init() {
			isMenuOpen = false;
		},
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
						ShowMenu: false,
						IsActivated: false
					});
				}
			});

		await response;
	}

	async function activateImage(index: number | null, activated: boolean) {
		if (index == null) {
			throw `Image index is missing.`;
		}
		type PostData = { ImageId: number; Activate: boolean };

		let postData: PostData = { ImageId: index, Activate: !activated };

		let response = controller.app
			.postForm('change-product-image-activation', postData, null)
			.then((response: any) => {
				if (response.Result == true) {
					controller.value.IsActivated = !activated;
				}
			});

		await response;
	}

	async function editImage(index: number | null) {
		if (index == null) {
			throw `Image index is missing.`;
		}

		let response = controller.app.openModal({
			form: 'edit-product-image',
			inputFieldValues: {
				Id: index
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

		{#if controller.value.IsActivated == false}
			<div class="watermark">Deactivated</div>
		{/if}

		{#if controller.value.ShowMenu}
			<div class="image-menu">
				<button
					class="delete-button"
					on:click={() => (isMenuOpen = !isMenuOpen)}
					aria-label="Ouvrir le menu contextuel"
				>
					<i class="fa-solid fa-gear" />
				</button>
				<div
					role="menu"
					tabindex="0"
					class="context-menu"
					style="display: {isMenuOpen ? 'block' : 'none'}"
					on:mouseleave={(event) => {
						const target = event.relatedTarget;
						if (!target || !(target instanceof Node) || !event.currentTarget.contains(target)) {
							isMenuOpen = false;
						}
					}}
				>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						role="menuitem"
						tabindex="0"
						class="context-menu-item"
						on:click={() => editImage(controller.value.Id)}
					>
						<i class="context-menu-item-icon fa-solid fa-edit" aria-hidden="true" /> Edit
					</div>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						role="menuitem"
						tabindex="0"
						class="context-menu-item"
						on:click={() =>
							activateImage(controller.value.Id, controller.value.IsActivated == true)}
					>
						{#if controller.value.IsActivated}
							<i class="context-menu-item-icon fa-solid fa-circle-stop" aria-hidden="true" /> Deactivate
						{:else}
							<i class="context-menu-item-icon fa-solid fa-circle-play" aria-hidden="true" /> Activate
						{/if}
					</div>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						role="menuitem"
						tabindex="0"
						class="context-menu-item"
						on:click={() => deleteImage(controller.value.Id)}
					>
						<i class="context-menu-item-icon fa-solid fa-trash-can" aria-hidden="true" /> Delete
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.watermark {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #fff;
		font-size: 24px;
		font-weight: bold;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 10px;
		border-radius: 4px;
	}

	.context-menu {
		position: absolute;
		z-index: 1000;
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 5px 0;
		left: 5px;
		top: 10px;
	}

	.context-menu-item {
		padding: 9px 20px;
		cursor: pointer;
		min-width: 120px;
	}

	.context-menu-item:hover {
		background-color: #f0f0f0;
	}

	.context-menu-item-icon {
		padding-right: 5px;
	}

	.image-container {
		position: relative;
		display: inline-block;
	}

	.output-image {
		margin: 2px;
	}

	.image-menu {
		position: absolute;
		top: 2px;
		right: 2px;
		background-color: rgb(0, 140, 255);
		border: none;
		border-bottom-left-radius: 50%;
		padding: 4px 10px 4px 10px;
	}

	.delete-button {
		cursor: pointer;
		color: white;
		border: none;
		background: transparent;
	}
</style>
