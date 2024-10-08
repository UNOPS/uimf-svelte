<script lang="ts" context="module">
	import { CreateInputOptions, InputController } from '../Infrastructure/InputController';

	interface DropdownValue {
		Value: string;
	}

	interface DropdownItem extends DropdownValue {
		Label: string;
	}

	interface Configuration {
		Source?: string | null;
		Parameters?: Array<{
			SourceType: string;
			Parameter: string;
			Source: string;
		}>;
		Items?: Array<DropdownItem>;
		DefaultValue?: string | null;
	}

	interface DropdownMetadata extends IInputFieldMetadata<Configuration> {}

	export class Controller extends InputController<DropdownValue, DropdownMetadata> {
		public valueAsString: string | null = null;
		public items: Array<DropdownItem> = [];

		public getValue(): Promise<DropdownValue | null> {
			return Promise.resolve(this.value);
		}

		async setValueInternal(value: DropdownValue | null): Promise<void> {
			return this.ensureItemsAreLoaded().then((items) => {
				if (value == null || value.Value == '' || value.Value == null) {
					this.value = this.metadata.Required ? null : { Value: '' };
					this.valueAsString = null;
				} else {
					this.value = items.find((t) => t.Value.toString() == value.Value.toString()) ?? null;
					this.valueAsString = this.serialize(this.value);
				}
				return Promise.resolve();
			});
		}

		public deserialize(value: string | null): Promise<DropdownValue | null> {
			if (value == null || value.length == 0) {
				return Promise.resolve(null);
			}

			return Promise.resolve({ Value: value });
		}

		public serialize(value: DropdownValue | null): string | null {
			return value != null && value.Value !== '' ? value.Value : null;
		}

		ensureItemsAreLoaded = async () => {
			if (this.items.length !== 0) {
				return Promise.resolve(this.items);
			}

			if (this.metadata.Component.Configuration.Items != null) {
				this.items = this.metadata.Component.Configuration.Items;
				return Promise.resolve(this.metadata.Component.Configuration.Items);
			}

			let formData: { [key: string]: any } = {};

			let parameters = this.metadata.Component.Configuration.Parameters ?? [];

			const promises = parameters.map(async (item) => {
				switch (item.SourceType) {
					case 'constant':
						formData[item.Parameter] = item.Source;
						return Promise.resolve();
					case 'response':
						formData[item.Parameter] = this.form?.response[item.Source].value;
						return Promise.resolve();
					case 'request':
						formData[item.Parameter] = await this.form?.inputs[item.Source].getValue();
						if (formData[item.Parameter] == null) {
							formData[item.Parameter] = this.form?.originalInputValues[item.Source];
						}

						return Promise.resolve();
				}
			});

			await Promise.all(promises);

			return await this.app
				.postForm(this.metadata.Component.Configuration.Source!, formData, null)
				.then((response: any) => {
					this.items = response.Items.map((t: any) => {
						return { Value: t.Value, Label: t.Label };
					});

					return this.items;
				});
		};
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { IInputFieldMetadata } from '../Infrastructure/uimf';
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let component = new InputComponent({
		async init() {
			controller.ensureItemsAreLoaded().then(function () {
				controller.items = controller.items;
			});
		},
		refresh() {
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
	{#each controller.items as item}
		<option value={item.Value}>{item.Label}</option>
	{/each}
</select>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	select.form-select {
		min-height: $app-input-min-height;
	}
</style>
