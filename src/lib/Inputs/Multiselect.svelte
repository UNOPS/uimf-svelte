<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	interface MultiselectValue {
		Items: any[];
	}

	export class Controller extends InputController<MultiselectValue, ITypeaheadMetadata> {
		public deserialize(value: string | null): Promise<MultiselectValue | null> {
			const parsedValue = value != null ? value.split(',') : null;
			const result: MultiselectValue | null = parsedValue != null ? { Items: parsedValue } : null;
			return Promise.resolve(result);
		}

		public serialize(value: MultiselectValue): string | null {
			const items = value?.Items?.filter((t) => t !== null && t !== undefined) || [];

			if (items.length === 0) {
				return null;
			}

			return items.join(',');
		}

		public getValue(): Promise<MultiselectValue | null> {
			var result =
				this.value?.Items != null && Array.isArray(this.value?.Items) && this.value.Items.length > 0
					? this.value
					: null;
			return Promise.resolve(result);
		}

		protected setValueInternal(value: MultiselectValue): Promise<void> {
			if (value == null || value.Items.length === 0) {
				this.value = null;
			}

			return Promise.resolve();
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import Select from 'svelte-select';
	import { InputComponent } from '../Infrastructure/Component';
	import { type ITypeaheadMetadata } from './Typeahead/Typeahead.svelte';
	import { TypeaheadSourceManager } from './Typeahead/Domain/TypeaheadSourceManager';
	import { IOption } from './Typeahead/Domain';

	export let controller: Controller;

	let source: TypeaheadSourceManager;
	let selected: IOption[] = [];

	let component = new InputComponent({
		async init() {
			source = new TypeaheadSourceManager(
				controller.metadata.Component.Configuration,
				controller.form!
			);

			selected = [];

			controller.ready?.resolve();
		},
		async refresh() {
			var capturedValue = controller?.value;

			if (capturedValue != null && controller.serialize(capturedValue)) {
				let results = await getAugmentedOption(capturedValue);

				if (controller.value != capturedValue) {
					// The value might have changed once the promise
					// has been resolved. In this case we do nothing, because
					// it would have been taken care of by another invocation.
					return;
				}

				selected = results;
			} else {
				selected = [];
				controller.value = null;
			}
		}
	});

	async function getAugmentedOption(capturedValue: MultiselectValue): Promise<IOption[]> {
		let results = await source.getOptionsAndFilter(capturedValue);

		return results?.length > 0
			? capturedValue.Items.map((t) => results.find((c) => c.Value == t)!)
			: [];
	}

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	async function loadOptionsAndFilter(query: MultiselectValue | string): Promise<any> {
		if (source == null) {
			return [];
		}

		return source.getOptionsAndFilter(query);
	}

	async function handleSelect(event: Event & { detail: any[] }) {
		if (event.detail != null && event.detail.length > 0) {
			selected = selected || [];
			selected.push(...event.detail);

			const items = selected.length > 0 ? [...new Set(selected.map((t) => t.Value))] : [];

			controller.setValue({ Items: items });
		}
	}

	const groupBy = (item: any) => item.Group;
</script>

<div class="input-container">
	<Select
		value={selected}
		label="SearchText"
		itemId="Value"
		required={controller.metadata.Required}
		{groupBy}
		createGroupHeaderItem={(group) => ({
			value: group,
			// Because `label="SearchText"` but we are actually using `item.Label`
			// we need to manually set each group item to have `Label` property.
			Label: group
		})}
		on:input={handleSelect}
		on:clear={() => {
			controller?.setValue(null);
			selected = [];
		}}
		multiple={true}
		hideEmptyState={true}
		placeholder="type to search..."
		loadOptions={loadOptionsAndFilter}
	>
		<div slot="item" let:item class={item.CssClass} class:item-slot={true}>
			<span>{@html item.Label}</span>
			{#if item.Description?.length > 0}
				<small>{@html item.Description}</small>
			{/if}
		</div>
		<div slot="selection" let:selection>
			{#if selection != null}
				<span>{@html selection.Label}</span>
			{/if}
		</div>
	</Select>
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.input-container {
		width: 100%;
		--height: #{$app-input-min-height};
		--padding: 0 6px 0 10px;
		--background: var(--bs-body-bg);
		--input-color: var(--bs-body-color);
		--font-size: #{$input-font-size};

		--item-height: auto;
		--item-color: var(--bs-body-color);
		--item-hover-color: var(--bs-body-color);
		--item-hover-bg: var(--bs-tertiary-bg);
		--item-is-active-bg: var(--bs-primary-bg-subtle);
		--item-is-active-color: var(--bs-body-color);
		--item-line-height: #{$app-input-min-height};
		--item-first-border-radius: 0;
		--selected-item-color: var(--bs-body-color);

		--group-title-font-size: 1rem;

		--clear-icon-color: var(--bs-body-color);
		--clear-icon-width: 12px;
		--clear-icon-height: 12px;

		--clear-select-width: 20px;
		--loading-width: 20px;

		--list-background: var(--bs-body-bg);
		--list-border: 1px solid var(--bs-border-color);
		--list-border-radius: 0;
		--list-shadow: none;

		--border: 1px solid var(--bs-border-color);
		--border-hover: 1px solid var(--bs-border-color);
		--border-focused: 1px solid #{$input-focus-border-color};
		--border-radius: 0;

		--multi-item-bg: var(--bs-body-bg);
		--multi-select-padding: var(--padding);
		--multi-item-height: 25px;
		--multi-item-clear-icon-color: var(--bs-body-color);
		--multi-item-outline: 1px solid var(--bs-border-color);
		--multi-select-input-margin: 0 0;

		.item-slot {
			padding: 6px 0;

			&:global(.inactive) {
				opacity: 0.5;
			}

			& > span {
				line-height: 1.8em;
				padding: 0;
				margin: 0;
				display: block;
			}

			& > small {
				font-size: 0.8em;
				display: block;
				opacity: 0.5;
				line-height: 1.2em;
				padding: 4px 0 6px;
				white-space: normal;
			}
		}

		& > :global(.svelte-select.focused) {
			box-shadow: 0 0 0 var(--bs-focus-ring-width) var(--bs-focus-ring-color);
		}
	}
</style>
