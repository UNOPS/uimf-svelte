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
	let selected: ITagOption[] | ITagOption | null = [];
	let multiple: boolean = true;

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
			multiple = controller.metadata.Component.Configuration.Multiple ?? true;
			selected = multiple ? [] : null;
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

				if (multiple) {
					selected = results;
				} else {
					selected = results.length > 0 ? results[0] : null;
				}
			} else {
				selected = multiple ? [] : null;
				controller.value = null;
			}
		}
	});

	const getAugmentedOptions = async (capturedValue: ITagValue): Promise<ITagOption[]> => {
		let results = await source.getOptionsAndFilter(capturedValue);

		return capturedValue.Items.map((item) => {
			const found = results?.find((c: ITypeaheadOption) => c.Value === item);
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

		let tagOptions: ITagOption[] = options.map((o: ITypeaheadOption) => ({
			Value: o.Value?.toString() ?? '',
			Label: o.Label,
			SearchText: o.SearchText ?? o.Label
		}));

		const queryLower = query?.toLowerCase() ?? '';
		const alreadyInOptions = tagOptions.some((o) => o.Value.toLowerCase() === queryLower);

		let alreadySelected = false;
		if (multiple && Array.isArray(selected)) {
			alreadySelected = selected.some((s: ITagOption) => s.Value.toLowerCase() === queryLower);
		} else if (!multiple && selected != null && typeof selected === 'object') {
			alreadySelected = (selected as ITagOption).Value.toLowerCase() === queryLower;
		}

		if (query && query.trim().length > 0 && !alreadyInOptions && !alreadySelected) {
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

	const handleSelect = (event: Event & { detail: ITagOption[] | ITagOption }) => {
		if (!multiple) {
			// Single selection mode
			const singleValue = event.detail as ITagOption;
			if (singleValue != null && singleValue.Value) {
				selected = singleValue;
				controller.setValue({ Items: [singleValue.Value] });
			} else {
				selected = null;
				controller.setValue(null);
			}
		} else {
			// Multiple selection mode
			const multipleValues = event.detail as ITagOption[];
			if (multipleValues != null && multipleValues.length > 0) {
				selected = multipleValues;
				const items = selected.length > 0 ? [...new Set(selected.map((t) => t.Value))] : [];
				controller.setValue({ Items: items });
			} else {
				selected = [];
				controller.setValue(null);
			}
		}
	};

	const handleClear = () => {
		controller?.setValue(null);
		selected = multiple ? [] : null;
	};
</script>

<div class="tag-input-container">
	<Select
		value={selected}
		inputAttributes={{ form: controller.form?.getFormId() }}
		label="Label"
		itemId="Value"
		required={controller.metadata.Required}
		floatingConfig={{ strategy: 'fixed' }}
		on:input={handleSelect}
		on:clear={handleClear}
		{multiple}
		hideEmptyState={true}
		placeholder={controller.metadata.Component.Configuration.Placeholder ??
			'type to search or add new...'}
		loadOptions={loadOptionsAndFilter}
		showChevron={false}
		clearable={false}
	>
		<div slot="item" let:item class="item-slot" class:tag-create-item={item.created}>
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
