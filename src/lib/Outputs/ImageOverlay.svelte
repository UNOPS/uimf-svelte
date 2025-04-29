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

			handleMouseEnter = () => (isHovered = true);
			handleMouseLeave = () => (isHovered = false);
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
	<div class="card-container">
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
			<div class="output-image-overlay">
				<img src={controller.value.Source} alt="img" />
			</div>
		</div>

		{#if controller.value.Title != null}
			<div class="title">{controller.value.Title}</div>
		{/if}
	</div>
{/if}

<style lang="scss">

:global(.cards-wrapper) {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	justify-content: center;
}

.card-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 310px;
	height: 350px;
    margin: 15px;
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
	overflow: hidden;
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
	background-color: rgba(0, 0, 0, 0.95);
	transition: opacity 0.4s;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
	font-size: 0.8em;
}

.title {
	margin-top: 10px;
    font-size: .9em;
    color: #2b2b2b;
    text-align: center;
}
</style>
