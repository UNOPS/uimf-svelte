<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface IValue extends ITypeaheadValue {
		Value: string;
	}

	interface IConfiguration extends ITypeaheadConfig {
		DefaultValue?: string | null;
	}

	interface IMetadata extends IInputFieldMetadata<IConfiguration> {}

	export class Controller extends InputController<IValue, IMetadata> {
		public valueAsString: string | null = null;
		public items: Array<IOption> = [];

		public getValue(): Promise<IValue | null> {
			return Promise.resolve(this.value);
		}

		async setValueInternal(value: IValue | null): Promise<void> {
			if (value == null || value.Value == '' || value.Value == null) {
				this.value = null;
				this.valueAsString = null;
			} else {
				this.valueAsString = this.serialize(this.value);
			}
			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<IValue | null> {
			if (value == null || value.length == 0) {
				return Promise.resolve(null);
			}

			return Promise.resolve({ Value: value });
		}

		public serialize(value: IValue | null): string | null {
			return value != null && value.Value !== '' ? value.Value?.toString() : null;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { IInputFieldMetadata } from '../Infrastructure/uimf';
	import { InputComponent } from '../Infrastructure/Component';
	import {
		IOption,
		ITypeaheadConfig,
		ITypeaheadValue,
		TypeaheadSourceManager
	} from './Typeahead/Domain';

	export let controller: Controller;

	let source: TypeaheadSourceManager;
	let items: Array<IOption> = [];

	let component = new InputComponent({
		async init() {
			source = new TypeaheadSourceManager(
				controller.metadata.Component.Configuration,
				controller.form!
			);
		},
		async refresh() {
			items = await source.getOptionsAndFilter(null);
			controller.valueAsString = controller.valueAsString;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<select
	class="form-select"
	aria-label="Dropdown"
	bind:value={controller.valueAsString}
	required={controller.metadata.Required}
	on:change={() => {
		controller.setValue(controller.valueAsString);
	}}
>
	<option value="" />
	{#each items as item}
		<option value={item.Value.toString()} class={item.CssClass}>{item.Label}</option>
	{/each}
</select>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	select.form-select {
		min-height: $app-input-min-height;
	}
</style>
