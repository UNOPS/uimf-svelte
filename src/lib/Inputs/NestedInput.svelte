<script lang="ts" context="module">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { ComponentMetadata, NestedComponentMetadata } from '$lib/Infrastructure/uimf';

	export interface ViewData {
		Value: { [key: string]: any };
	}
	export class Controller extends InputController<ViewData, NestedComponentMetadata> {
		declare views: Array<{
			metadata: ComponentMetadata;
			controller: InputController<any>;
		}>;

		constructor(options: CreateInputOptions<NestedComponentMetadata>) {
			super(options);

			this.views = [];

			this.metadata.Properties.sort((x, y) => x.OrderIndex - y.OrderIndex);

			for (const view of this.metadata.Properties) {
				let controllerClass = controlRegister.inputs[view.Type].controller;

				this.views.push({
					metadata: view,
					controller: new controllerClass({
						metadata: view,
						form: this.form,
						defer: null,
						app: this.app
					})
				});
			}
		}

		public getValue(): Promise<ViewData | null> {
			let effectiveValue: { [x: string]: any } = {};

			let promises = this.views.map(function (view) {
				return view.controller.getValue().then(function (value: any) {
					effectiveValue[view.metadata.Id] = value;
				});
			});

			return Promise.all(promises).then(function () {
				return { Value: effectiveValue };
			});
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			return Promise.resolve(JSON.parse(value ?? 'null') as ViewData);
		}

		public serialize(value: ViewData | null): string | null {
			return JSON.stringify(value);
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			let promises = [];

			this.value = value ?? { Value: {} };

			for (const view of this.views) {
				promises.push(view.controller.setValue(this.value.Value[view.metadata.Id]));
			}

			return Promise.all(promises).then(() => {
				return Promise.resolve();
			});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { InputComponent } from '../Infrastructure/Component';
	import Input from '../Input.svelte';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.views = controller.views;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

{#each controller.views as view}
	<div>
		<Input controller={view.controller} />
	</div>
{/each}

<style>
	div {
		margin-bottom: 20px;
	}
</style>
