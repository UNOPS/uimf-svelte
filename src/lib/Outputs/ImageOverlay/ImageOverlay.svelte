<script lang="ts" context="module">
	interface Configuration {
		Item: any;
		Inner: IComponent;
		Outer: IComponent;
		CssClass?: string;
	}

	interface IMetadata extends IOutputFieldMetadata<Configuration> {}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IComponent, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import uuid from '../../Infrastructure/Utilities/uuid';

	export let controller: OutputController<ImageOverlay, IMetadata>;

	interface ImageOverlay {
		Subtitle: null;
		Source: string;
		MaxWidth: string;
		Url: string;
		InnerContent: any | null;
		OuterContent: any | null;
		Title: string | null;
		Header: string | null;
	}

	let isHovered: boolean;
	let handleMouseEnter: () => void;
	let handleMouseLeave: () => void;

	let innerNestedComponent: ConstructorOfATypedSvelteComponent;
	let outerNestedComponent: ConstructorOfATypedSvelteComponent;

	const inner = controller.metadata.Component.Configuration.Item.Configuration.Inner;
	const innerComponentRegistration = controlRegister.outputs[inner.Type];

	if (innerComponentRegistration == null) {
		throw `Cannot find output for type '${controller.metadata.Component.Type}'.`;
	}

	const cssClass =
		controller.metadata.Component.Configuration.Item.Configuration.Inner.Configuration.CssClass;

	const outer = controller.metadata.Component.Configuration.Item.Configuration.Outer;
	const outerComponentRegistration = controlRegister.outputs[outer.Type];

	innerNestedComponent = innerComponentRegistration.component;
	outerNestedComponent = outerComponentRegistration.component;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			handleMouseEnter = () => (isHovered = true);
			handleMouseLeave = () => (isHovered = false);
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	export function makeController(value: any, component: any) {
		return new OutputController<any>({
			metadata: {
				Component: component,
				Hidden: false,
				Id: uuid(),
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

	// Do not redirect to the url if a button is clicked inside
	// the nested component
	function handleOverlayClick(event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (target.closest('button')) {
			event.preventDefault();
			return;
		}

		window.location.href = controller.value.Url;
	}
</script>

{#if controller.value != null}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="card-container" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
		<div class="image-container" role="button" tabindex="0" aria-label="Image Overlay">
			{#if controller.value.Header}
				<div class="header">{controller.value.Header}</div>
			{/if}
			{#if isHovered}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="overlay-container">
					<div class="overlay text-container" on:click|capture={handleOverlayClick}>
						<div class={cssClass}>
							<svelte:component
								this={innerNestedComponent}
								controller={makeController(controller.value.InnerContent, inner)}
							/>
						</div>
					</div>
				</div>
			{/if}

			<div class="output-image-overlay">
				<img src={controller.value.Source} alt="img" />
			</div>
		</div>

		{#if isHovered}
			<div class="overlay-action">
				<svelte:component
					this={outerNestedComponent}
					controller={makeController(controller.value.OuterContent, outer)}
				/>
			</div>
		{:else if controller.value.Title != null}
			<a class="title" href={controller.value.Url}>{@html controller.value.Title}</a>

			{#if controller.value.Subtitle != null}
				<a class="subtitle" href={controller.value.Url}>{@html controller.value.Subtitle}</a>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	:global(.cards-wrapper) {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}

	.card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 310px;
		height: 390px;
		margin: 25px 20px;
	}

	.overlay-container {
		display: flex;
		align-self: flex-start;
	}

	.overlay-action {
		padding-top: 5px;
		background-color: white;
		width: 100%;
		opacity: 1;
		z-index: 1;
		display: flex;
	}

	.image-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 280px;
		background: #e0e0e0;
		border: 0.5px solid #c7c7c7;
		border-radius: 0%;
		width: 100%;
	}

	.output-image-overlay {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.output-image-overlay img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		color: white;
		background-color: rgb(33 143 207 / 80%);
		transition: opacity 0.4s;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 4;
		font-size: 0.8em;
	}

	.title {
		margin-top: 10px;
		font-size: 1em;
		color: #218fcf;
		text-align: center;
		text-decoration: none;
	}

	.subtitle {
		margin-top: 10px;
		font-size: 1em;
		color: #999999;
		text-align: center;
		text-decoration: none;
	}

	.text-container {
		opacity: 1 !important;
		color: white;
	}

	.header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background-color: purple;
		color: #fff;
		padding: 5px 10px;
		font-size: 0.8em;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0.5px solid #c7c7c7;
	}
</style>
