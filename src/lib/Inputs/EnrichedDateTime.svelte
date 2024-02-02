<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export interface ViewData {
		Date: any;
		MinDate: any;
		MaxDate: any;
	}

	export class Controller extends InputController<ViewData, ComponentMetadata> {
		declare view: {
			metadata: ComponentMetadata;
			controller: InputController<Date>;
		};

		public getValue(): Promise<ViewData | null> {
			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<ViewData | null> {
			if (value == null || value.trim().length == 0) {
				return Promise.resolve(null);
			}

			return Promise.resolve(JSON.parse(value ?? 'null') as ViewData);
		}

		public serialize(value: ViewData | null): string | null {
			return JSON.stringify(value);
		}

		protected setValueInternal(value: ViewData | null): Promise<void> {
			if (value != null) {
				let controllerClass = controlRegister.inputs['datetime'].controller;

				this.value = value;

				this.view = {
					metadata: this.metadata,
					controller: new controllerClass({
						metadata: this.metadata,
						form: this.form,
						defer: null,
						app: this.app
					})
				};
				this.view.controller.setValue(new Date(value.Date));
			}

			return Promise.resolve();
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.view = controller.view;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

{#if controller.view?.controller != null}
	<div>
		<svelte:component
			this={controlRegister.inputs['datetime'].component}
			controller={controller.view.controller}
			minDate={controller.value?.MinDate}
			maxDate={controller.value?.MaxDate}
		/>
	</div>
{/if}
