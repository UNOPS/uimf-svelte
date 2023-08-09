<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	import type { ComponentMetadata, NestedComponentMetadata } from '$lib/Infrastructure/uimf';

	export interface ViewData {
		Value: { [key: string]: any };
	}
	export class Controller extends InputController<ViewData> {
		declare metadata: NestedComponentMetadata;

		declare views: Array<{
			options: ComponentMetadata;
			controller: any;
		}>;

		declare updateViewsFunction: () => void;

		public getValue(): Promise<ViewData | null> {
			let effectiveValue: { [x: string]: any } = {};
			let promises = this.views.map(function (view) {
				return view.controller.getValue().then(function (value: any) {
					effectiveValue[view.options.Id] = value;
				});
			});

			if (this.ready === null) {
				return Promise.resolve({
					Value: effectiveValue
				});
			}

			return Promise.all(promises).then(function () {
				return Promise.resolve({
					Value: effectiveValue
				});
			});
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			return Promise.resolve(JSON.parse(value ?? 'null') as ViewData);
		}

		public serialize(value: ViewData | null): string | null {
			return JSON.stringify(value);
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			if (value == null) {
				return Promise.resolve();
			}

			if (this.views == null) {
				this.views = [];
				return this.initializeComponents();
			}

			let promiseArray = [];
			for (const view of this.views) {
				let v = value?.Value[view.options.Id];
				promiseArray.push(view.controller.setValue(v));
			}

			return Promise.all(promiseArray).then(() => {
				return Promise.resolve();
			});
		}

		createController(metadata: ComponentMetadata): InputController<any> {
			let controllerClass = controlRegister.inputs[metadata.Type].controller;
			return new controllerClass(metadata, this.form, null, this.app);
		}

		public initializeComponents(): Promise<void> {
			this.views.splice(0, this.views.length);

			for (const view of this.metadata.Properties) {
				let controller = this.createController(view);
				this.views.push({
					options: view,
					controller: controller
				});
			}
			return this.setValueInternal(this.value).then(() => {
				this.views.sort((x, y) => x.options.OrderIndex - y.options.OrderIndex);
				this.updateViewsFunction?.();
				return Promise.resolve();
			});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { InputComponentController } from '../Infrastructure/ComponentController';

	export let controller: Controller;

	let viewTarget: HTMLElement;
	let views: any[] = [];

	const updateViews = () => {
		views = views;
	};

	let component = new InputComponentController({
		init() {
			component?.setup(controller).then(() => {
				//This "weird" condition is needed because
				//when nested input is summoned from a conditional input
				//aka the controller is created before the component,
				//setValueInternal will be called and initialize this.view
				//so we want to make sure the reference works for both sides
				if (controller.views != null) {
					views = controller.views;
				} else {
					controller.views = views;
				}
				controller.updateViewsFunction = updateViews;
				controller.initializeComponents().then(() => {
					controller.ready?.resolve();
				});
			});
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div bind:this={viewTarget}>
	{#each views as view}
		<label class="form-label">{view.options.Label}</label>
		<svelte:component
			this={controlRegister.inputs[view.options.Type].component}
			controller={view.controller}
		/>
	{/each}
</div>
