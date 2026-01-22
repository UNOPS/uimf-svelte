<script context="module" lang="ts">
	import { InputController } from '@Infrastructure/InputController';
	import type { ITagValue } from './tag-types';

	export class Controller extends InputController<ITagValue> {
		public deserialize = (value: string | null): Promise<ITagValue | null> => {
			const parsedValue = value != null ? value.split(',') : null;
			const result: ITagValue | null = parsedValue != null ? { Items: parsedValue } : null;
			return Promise.resolve(result);
		};

		public serialize = (value: ITagValue | null): string | null => {
			let items = value?.Items?.filter((t) => t != null) || [];
			items = [...new Set(items)];
			items.sort((a, b) => a.localeCompare(b));

			if (items.length === 0) {
				return null;
			}

			return items.join(',');
		};

		public getValue = (): Promise<ITagValue | null> => {
			const result =
				this.value?.Items != null && Array.isArray(this.value?.Items) && this.value.Items.length > 0
					? this.value
					: null;
			return Promise.resolve(result);
		};

		protected setValueInternal = (value: ITagValue): Promise<void> => {
			if (value == null || value.Items.length === 0) {
				this.value = null;
			}
			return Promise.resolve();
		};
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import Select from 'svelte-select';
	import { InputComponent } from '@Infrastructure/Component';
	import { PickerManager } from '@Inputs/Typeahead/Domain/Picker/PickerManager';
	import type { ITypeaheadOption } from '@Inputs/Typeahead/Domain/index';
	import type { ITagOption } from './index';

	export let controller: Controller;
	let source: PickerManager<ITypeaheadOption>;
	let selected: ITagOption[] = [];

	let component = new InputComponent({
		async init() {
			source = new PickerManager(
				{
					...controller.metadata.Component.Configuration,
					ForDropdown: false,
					Subtype: controller.metadata.Component.Configuration.Subtype ?? 'String'
				},
				controller
			);
			selected = [];
		},
		async refresh() {
			const capturedValue = controller?.value;
			const capturedValueSerialized = controller.serialize(capturedValue);

			if (capturedValue != null && capturedValueSerialized != null) {
				let results = await getAugmentedOptions(capturedValue);
				const currentValueSerialized = controller.serialize(controller.value);

				if (currentValueSerialized != capturedValueSerialized) {
					return;
				}

				selected = results;
			} else {
				selected = [];
				controller.value = null;
			}
		}
	});

	const getAugmentedOptions = async (capturedValue: ITagValue): Promise<ITagOption[]> => {
		let results = await source.getOptionsAndFilter(capturedValue);

		return capturedValue.Items.map((item) => {
			const found = results?.find((c: any) => c.Value === item);
			if (found) {
				return {
					Value: found.Value?.toString() ?? '',
					Label: found.Label,
					SearchText: found.SearchText ?? found.Label
				};
			}
			return {
				Value: item,
				Label: item,
				SearchText: item
			};
		});
	};

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	const loadOptionsAndFilter = async (query: string): Promise<ITagOption[]> => {
		if (source == null) {
			return [];
		}

		const options = await source.getOptionsAndFilter(query);

		let tagOptions: ITagOption[] = options.map((o: any) => ({
			Value: o.Value?.toString() ?? '',
			Label: o.Label,
			SearchText: o.SearchText ?? o.Label
		}));

		if (
			query &&
			query.trim().length > 0 &&
			!tagOptions.some((o) => o.Value.toLowerCase() === query.toLowerCase()) &&
			!selected.some((s) => s.Value.toLowerCase() === query.toLowerCase())
		) {
			tagOptions = [
				{
					Value: query,
					Label: query,
					SearchText: query,
					created: true
				},
				...tagOptions
			];
		}

		return tagOptions;
	};

	const handleSelect = (event: Event & { detail: ITagOption[] }) => {
		if (event.detail != null && event.detail.length > 0) {
			selected = event.detail;
			const items = selected.length > 0 ? [...new Set(selected.map((t) => t.Value))] : [];
			controller.setValue({ Items: items });
		} else {
			selected = [];
			controller.setValue(null);
		}
	};

	const handleClear = () => {
		controller?.setValue(null);
		selected = [];
	};

	const removeTag = (index: number) => {
		selected = selected.filter((_, i) => i !== index);
		controller.setValue({ Items: selected.map((t) => t.Value) });
	};
</script>

<div class="tag-input-container">
	<Select
		value={selected}
		inputAttributes={{ form: controller.form?.getFormId() }}
		label="SearchText"
		itemId="Value"
		required={controller.metadata.Required}
		floatingConfig={{ strategy: 'fixed' }}
		on:input={handleSelect}
		on:clear={handleClear}
		multiple={true}
		hideEmptyState={true}
		placeholder={controller.metadata.Component.Configuration.Placeholder ?? 'type to search or add new...'}
		loadOptions={loadOptionsAndFilter}
		showChevron={false}
		clearable={false}
	>
		<div slot="prepend">
			{#each selected as item, index}
				<span class="label label-default tag-pill">
					{item.Label}
					<button
						type="button"
						class="tag-remove"
						on:click|stopPropagation={() => removeTag(index)}
						aria-label="Remove {item.Label}"
					>
						&times;
					</button>
				</span>
			{/each}
		</div>
		<div slot="item" let:item class="tag-dropdown-item" class:tag-create-item={item.created}>
			{#if item.created}
				<span><strong>Create:</strong> {item.Label}</span>
			{:else}
				<span>{@html item.Label}</span>
			{/if}
		</div>
	</Select>
</div>

<style lang="scss">
	@import './tag-styles.scss';
</style>


