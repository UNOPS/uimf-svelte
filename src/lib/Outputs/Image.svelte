<script lang="ts" context="module">
	interface Image {
		Source: string;
		Width: string | null;
		Height: string | null;
		AltText: string | null;
		Url: string | null;
		Id: number | null;
		IsActivated: boolean | null;
		MenuActions: ActionListData | null;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import ActionList, { ActionListController, type ActionListData } from './ActionList.svelte';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

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
			metadata: {} as ComponentMetadata,
			data: data,
			form: controller.form!,
			app: controller.app
		}) as ActionListController;
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
						<ActionList
							controller={buildControllers(controller.value.MenuActions)}
							isVertical={true}
						/>
					{/if}
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

	.menu-button {
		cursor: pointer;
		color: white;
		border: none;
		background: transparent;
	}
</style>
