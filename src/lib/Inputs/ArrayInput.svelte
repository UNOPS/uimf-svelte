<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export interface InputItem {
		controller: InputController<any>;
		options: ComponentMetadata;
	}
	export interface ArrayInputData {
		Items: any[];
	}

	export interface ArrayInputMetadata extends ComponentMetadata {
		AllowNewItems: boolean;
		ItemMetadata: ComponentMetadata[];
	}

	export type ViewData = {
		header: string;
		comment: string;
	} & {
		[id: string]: {
			options: ComponentMetadata;
			controller: any;
		};
	};

	export class Controller extends InputController<ArrayInputData> {
		declare metadata: ArrayInputMetadata;

		declare views: Array<ViewData>;

		declare updateViewsFunction: () => void;

		public async getValue(): Promise<ArrayInputData | null> {
			let outputViews = [];

			for (let i = 0; i < this.views.length; ++i) {
				const { header, comment, ...rest } = this.views[i];
				let outputView = {
					Comment: comment,
					Header: header
				};

				let restComponents = Object.values({ ...rest });
				for (let j = 0; j < restComponents.length; ++j) {
					outputView = {
						...outputView,
						[restComponents[j].options.Id]: await restComponents[j].controller.getValue()
					};
				}

				outputViews.push(outputView);
			}

			return Promise.resolve({
				Items: outputViews
			});
		}

		public deserialize(value: string | null): Promise<ArrayInputData | null> {
			return Promise.resolve(JSON.parse(value ?? 'null') as ArrayInputData);
		}

		public serialize(value: ArrayInputData | null): string | null {
			return JSON.stringify(value);
		}

		protected setValueInternal(value: ArrayInputData | null): Promise<void> {
			if (value == null) {
				return Promise.resolve();
			}
			return this.initializeComponents();
		}

		public removeView(index: number): Promise<void> {
			this.views.splice(index, 1);
			this.updateViewsFunction();
			return Promise.resolve();
		}

		public addView(): Promise<void> {
			return this.createView().then((view) => {
				this.views.push(view);
				this.updateViewsFunction();
				return Promise.resolve();
			});
		}

		createController(metadata: ComponentMetadata): InputController<any> {
			let controllerClass = controlRegister.inputs[metadata.Type].controller;
			return new controllerClass({
				metadata: metadata,
				form: this.form,
				defer: null,
				app: this.app
			});
		}

		createView(): Promise<ViewData> {
			let view = {
				comment: '',
				header: ''
			} as ViewData;

			for (let j = 0; j < this.metadata.ItemMetadata.length; ++j) {
				let metadata = this.metadata.ItemMetadata[j];
				let controller = this.createController(metadata);
				view = {
					...view,
					[metadata.Id]: {
						options: metadata,
						controller: controller
					}
				};
			}

			return Promise.resolve(view);
		}

		public initializeComponents(): Promise<void> {
			this.views.splice(0, this.views.length);
			this.metadata.ItemMetadata.sort((a, b) => a.OrderIndex - b.OrderIndex);

			if (this.value == null || this.value.Items == null) {
				this.updateViewsFunction?.();
				return Promise.resolve();
			}
			let promiseArray = [];

			for (let i = 0; i < this.value.Items.length; ++i) {
				let view = {
					comment: this.value.Items[i].Comment,
					header: this.value.Items[i].Header
				} as ViewData;
				for (let j = 0; j < this.metadata.ItemMetadata.length; ++j) {
					let metadata = this.metadata.ItemMetadata[j];
					let controller = this.createController(metadata);
					view = {
						...view,
						[metadata.Id]: {
							options: metadata,
							controller: controller
						}
					};
					promiseArray.push(controller.setValue(this.value.Items[i][metadata.Id]));
				}
				this.views.push(view);
			}

			return Promise.all(promiseArray).then(() => {
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
	let views: ViewData[] = [];

	let componentViews: {
		options: ComponentMetadata;
		controller: any;
	}[][] = [];

	const getComponentViews = () => {
		let arr = [];
		for (let i = 0; i < views.length; ++i) {
			const { header, comment, ...rest } = views[i];
			arr.push(Object.values({ ...rest }));
		}
		return arr;
	};

	const updateViews = () => {
		views = views;
		componentViews = getComponentViews();
	};

	let component = new InputComponentController({
		init() {
			component?.setup(controller).then(() => {
				if (controller.views != null) {
					views = controller.views;
				} else {
					controller.views = views;
				}
				controller.updateViewsFunction = updateViews;
				controller.ready?.resolve();
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

<div>
	{#each views as item, idx}
		<div>
			<strong>{item.header}</strong>
			<span>
				<i class="fas fa-arrow-alt-circle-right" />{item.comment}
			</span>
			{#if controller.metadata.AllowNewItems}
				<button
					type="button"
					class="btn btn-lg btn-danger"
					on:click={() => {
						controller.removeView(idx);
					}}>Remove</button
				>
			{/if}
		</div>
		<div class="items">
			{#each componentViews[idx] as componentItem}
				{#if componentItem.controller.metadata.Hidden != true}
					<div>
						<label class="form-label" for={componentItem.options.Id}>
							{componentItem.options.Label}
						</label>
						<svelte:component
							this={controlRegister.inputs[componentItem.options.Type].component}
							controller={componentItem.controller}
							id={componentItem.options.Id}
						/>
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>

{#if controller.metadata.AllowNewItems}
	<button
		type="button"
		class="btn btn-lg btn-primary"
		on:click={() => {
			controller.addView();
		}}>Add</button
	>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.btn-primary {
		color: white;
	}

	.btn-primary:hover {
		color: white;
	}

	.items {
		padding: 2%;
	}

	.form-label {
		width: 100%;
	}
</style>
