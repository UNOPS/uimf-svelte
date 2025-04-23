<script lang="ts" context="module">
	interface Configuration {
		Item: any;
		Inner: IComponent;
		CssClass?: string;
	}

	interface IMetadata extends IFieldMetadata<Configuration> {}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent } from '$lib/Infrastructure/uimf';

	export let controller: OutputController<ImageOverlay, IMetadata>;

	interface ImageOverlay {
		Source: string;
		MaxWidth: string;
		Url: string;
		InnerContent: any | null;
		Title: string | null;
	}

	let isHovered: boolean;
	let handleMouseEnter: () => void;
	let handleMouseLeave: () => void;

	let nestedComponent: ConstructorOfATypedSvelteComponent;

	const inner = controller.metadata.Component.Configuration.Item.Configuration.Inner;
	const cssClass =
		controller.metadata.Component.Configuration.Item.Configuration.Inner.Configuration.CssClass;

	const componentRegistration = controlRegister.outputs[inner.Type];

	if (componentRegistration == null) {
		throw `Cannot find output for type '${controller.metadata.Component.Type}'.`;
	}

	nestedComponent = componentRegistration.component;

	let component = new OutputComponent({
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

	export function makeController(value: any) {
		return new OutputController<any>({
			metadata: {
				Component: inner,
				Hidden: false,
				Id: Date.now().toString(),
				Label: '',
				OrderIndex: 0,
				HideIfNull: false,
				CssClass: cssClass
			},
			data: value,
			form: controller.form!,
			app: controller.app,
			parent: controller
		});
	}
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
				<div class={cssClass}>
					<a href={controller.value.Url}>
						<svelte:component
							this={nestedComponent}
							controller={makeController(controller.value.InnerContent)}
						/>
					</a>
				</div>
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
		height: 30vh;
		background: #fbf6f6;
		border-radius: 0%;
		border-color: #c7c7c7;
		border-style: solid;
		padding: 0;
		margin: 10px;
		border-width: 0.5px;
		max-width: 310px;
		min-width: 307px;
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
		font-size: 0.8em;
	}

	.output-image-overlay:hover .overlay {
		opacity: 0;
		box-shadow: 7px 7px 5px lightgray;
	}
</style>
