<script lang="ts" context="module">
	interface Image {
		ZoomInPhotoId: number | null;
		Source: string;
		Width: string | null;
		Height: string | null;
		AltText: string | null;
		Url: string | null;
		Id: number | null;
		IsActivated: boolean | null;
		MenuActions: ActionListData | null;
		DisplayOrder: number | null;
		FitContainer: boolean | null;
		CssClass: string | null;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import ActionList, {
		ActionListController,
		type ActionListData
	} from '../ActionList/ActionList.svelte';
	import type { IFieldMetadata } from '../../Infrastructure/uimf';

	export let controller: OutputController<Image>;
	export let height: string | null;

	let isMenuOpen: boolean;

	let component = new OutputComponent({
		init() {
			isMenuOpen = false;
		},
		refresh() {
			if (controller.value?.MenuActions != null) {
				buildControllers(controller.value?.MenuActions);
			}

			controller.value = controller.value;
		}
	});

	function buildControllers(data: ActionListData) {
		return new OutputController<ActionListData>({
			metadata: {} as IFieldMetadata,
			data: data,
			form: controller.form!,
			app: controller.app,
			parent: controller
		}) as ActionListController;
	}

	beforeUpdate(async () => await component.setup(controller));

	function openPopUp(photoId: number | null): void {
		if (photoId == null) {
			return;
		}

		controller.app.openModal({
			form: 'image-popup',
			inputFieldValues: { Id: photoId }
		});
	}
</script>

{#if controller.value != null}
	<div class="image-container" class:fit-container={controller.value.FitContainer}>
		{#if controller.value.Url != null}
			<a href={controller.value.Url}>
				<img
					class={controller.value.CssClass}
					style:width={controller.value.Width}
					style:height={height ?? controller.value.Height}
					src={controller.value.Source}
					alt={controller.value.AltText}
				/>
			</a>
		{:else if controller.value.ZoomInPhotoId != null}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={() => openPopUp(controller.value.ZoomInPhotoId)} class="zoom-link">
				<img
					class={controller.value.CssClass}
					style:width={controller.value.Width}
					style:height={height ?? controller.value.Height}
					src={controller.value.Source}
					alt={controller.value.AltText}
				/>
			</a>
		{:else}
			<img
				class="output-image {controller.value.CssClass}"
				style:width={controller.value.Width}
				style:height={height ?? controller.value.Height}
				src={controller.value.Source}
				alt={controller.value.AltText}
			/>
		{/if}

		{#if controller.value.IsActivated == false}
			<div class="watermark">Deactivated</div>
		{/if}

		{#if controller.value.DisplayOrder != null}
			<div class="display-order">{controller.value.DisplayOrder}</div>
		{/if}

		{#if controller.value.MenuActions != null}
			<div class="image-menu">
				<button
					class="menu-button"
					on:click={() => (isMenuOpen = !isMenuOpen)}
					aria-label="Open image menu"
				>
					<i class="fa-solid fa-gear" />
				</button>
				<!-- svelte-ignore a11y-unknown-role -->
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					role="menu-button"
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
					{#if controller.value.MenuActions}
						<ActionList controller={buildControllers(controller.value.MenuActions)} />
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	$btn-size: 100px;

	:global(.image-menu .context-menu .action-list button) {
		width: $btn-size;
		border: none;
	}

	:global(.image-menu .context-menu .action-list) {
		margin: 0;
		padding: 0;
	}

	:global(.image-menu .context-menu .action-list > div) {
		margin-right: 0;
	}

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
		min-width: $btn-size;
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

	.fit-container {
		width: 100%;
	}

	.output-image {
		margin: 2px;
	}

	.display-order {
		font-weight: bold;
		position: absolute;
		top: 2px;
		left: 2px;
		background-color: #c8ff6f;
		border: none;
		border-bottom-right-radius: 50%;
		padding: 6px 12px;
	}

	.image-menu {
		position: absolute;
		top: 2px;
		right: 2px;
		background-color: #008cff;
		border: none;
		border-bottom-left-radius: 50%;
		padding: 5px;
	}

	.menu-button {
		cursor: pointer;
		color: white;
		border: none;
		background: transparent;
	}

	.zoom-link:hover img {
		cursor: zoom-in;
	}
</style>
