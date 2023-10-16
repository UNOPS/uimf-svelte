<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface DropdownValue {
		Value: string;
	}

	interface DropdownItem extends DropdownValue {
		Label: string;
	}

	interface DropdownMetadata extends ComponentMetadata {
		DefaultValue: any;
		CustomProperties: {
			Source: string;
			Parameters: Array<{
				SourceType: string;
				Parameter: string;
				Source: string;
			}>;
			Items: Array<DropdownItem>;
		};
	}

	export class Controller extends InputController<DropdownValue> {
		public valueAsString: string | null = null;
		declare metadata: DropdownMetadata;
		public items: Array<DropdownItem> = [];

		public getValue(): Promise<DropdownValue | null> {
			return Promise.resolve(this.value);
		}

		setValueInternal(value: DropdownValue | null): Promise<void> {
			return this.ensureItemsAreLoaded().then((items) => {
				if (value == null || value.Value == '' || value.Value == null) {
					const effectiveValue =
						this.metadata.DefaultValue != null && this.form?.hasOriginalInputValues() !== true
							? items.find((i) => i.Value == this.metadata.DefaultValue) ?? null
							: null;

					this.value = this.metadata.Required ? effectiveValue : effectiveValue ?? { Value: '' };
					this.valueAsString = effectiveValue?.Value ?? null;
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

			if (this.metadata.CustomProperties.Items != null) {
				this.items = this.metadata.CustomProperties.Items;
				return Promise.resolve(this.metadata.CustomProperties.Items);
			}

			let formData: { [key: string]: any } = {};

			let parameters = this.metadata.CustomProperties.Parameters;

			if (parameters != null) {
				const promises = parameters.map(async (item) => {
					switch (item.SourceType) {
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
			}

			return await fetch('api/form/run', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/plain, */*'
				},
				body: JSON.stringify([
					{
						Form: this.metadata.CustomProperties.Source,
						InputFieldValues: formData
					}
				])
			})
				.then((response) => response.json())
				.then((data) => {
					this.items = data[0].Data.Items.map((t: any) => {
						return { Value: t.Value, Label: t.Label };
					});

					return this.items;
				});
		};
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let component = new InputComponent({
		init() {
			controller.ensureItemsAreLoaded().then(function () {
				controller.items = controller.items;
				controller.ready?.resolve();
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
	@import '../../scss/styles.scss';

	select.form-select {
		min-height: $app-input-min-height;
	}
</style>
