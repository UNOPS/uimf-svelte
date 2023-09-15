<script lang="ts">
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { beforeUpdate } from 'svelte';

	export let controller: OutputController<ImageOverlay>;

	interface ImageOverlay {
		Source: string;
		MaxWidth: string;
		Url: string;
		InnerTitle: string;
		InnerContent: string[];
		Title: string | null;
	}

	let isHovered: boolean;
	let handleMouseEnter: () => void;
	let handleMouseLeave: () => void;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;

			handleMouseEnter = function handleMouseEnter() {
				isHovered = true;
			};

			handleMouseLeave = function handleMouseLeave() {
				isHovered = false;
			};
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<div
		class="image-container"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		role="button"
		tabindex="0"
		aria-label="Image Overlay"
	>
		{#if isHovered}
			<div class="overlay">
				<a href={controller.value.Url}>
					<div class="inner-title">{controller.value.InnerTitle}</div>
					<ul>
						{#each controller.value.InnerContent as line}
							<li class="inner-text">{line}</li>
						{/each}
					</ul>
				</a>
			</div>
		{/if}
		<div class="output-image-overlay"><img src={controller.value.Source} alt="img" /></div>

		<div class="title-container">
			{#if controller.value.Title != null}
				<div class="title">{controller.value.Title}</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.title-container {
		position: absolute;
		height: 12%;
		bottom: 0px;
	}

	.image-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 20vh;
		background: #fbf6f6;
		border-radius: 0%;
		border-color: #c7c7c7;
		border-style: solid;
		padding: 0;
		margin: 10px;
		border-width: 0.5px;
		max-width: 250px;
		min-width: 247px;
		overflow: hidden;
	}

	.output-image-overlay {
		max-width: 360px;
		max-height: 360px;
		overflow: hidden;
		top: 0px;
		height: 85%;
		position: absolute;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(53, 53, 53, 0.9);
		transition: opacity 0.4s;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		opacity: 1;
	}

	.output-image-overlay:hover .overlay {
		opacity: 0;
		box-shadow: 7px 7px 5px lightgray;
	}

	.inner-title {
		position: absolute;
		color: white;
		font-size: 14px;
		text-align: center;
		font-weight: bold;
		top: 5%;
	}

	.inner-text {
		position: relative;
		color: white;
		font-size: 12px;
		line-height: 1em;
	}

	.inner-text ul,
	li {
		line-height: 1em;
	}

	.title {
		color: rgb(52, 134, 211);
		font-size: 16px;
		text-align: center;
		position: relative;
		bottom: 0px;
		left: 0;
		right: 0;
	}
</style>
