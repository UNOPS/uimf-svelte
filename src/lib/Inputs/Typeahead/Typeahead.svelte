<script context="module" lang="ts">
	import { InputController } from '../../Infrastructure/InputController';

	interface IConfiguration extends ITypeaheadConfig {
		DefaultValue?: string | null;
		SelectAll?: boolean;
	}

	export interface ITypeaheadMetadata extends IInputFieldMetadata<IConfiguration> {}

	export class Controller extends InputController<ITypeaheadValue, ITypeaheadMetadata> {
		public getValue(): Promise<ITypeaheadValue | null> {
			var result = this.value?.Value != null ? this.value : null;

			return Promise.resolve(result);
		}

		public deserialize(value: string | null): Promise<ITypeaheadValue | null> {
			var result = value == null || value === '' ? null : { Value: value };

			return Promise.resolve(result);
		}

		public serialize(value: ITypeaheadValue | null): string | null {
			return value?.Value != null ? value.Value : null;
		}

		protected override setValueInternal(value: ITypeaheadValue | null): Promise<void> {
			return Promise.resolve();
		}
	}

	export function augmentItems(items: IOption[]): IOption[] {
		if (items == null) {
			return [];
		}

		return items.map((c) => {
			if (c.SearchText == null || c.SearchText.length == 0) {
				c.SearchText = c.Label + ' ' + c.Value + ' ' + (c.Description ?? '');
			}

			// Always search in lowercase.
			c.SearchText = c.SearchText.toLocaleLowerCase();

			return c as IOption;
		});
	}
</script>

<script lang="ts">
	import Select from 'svelte-select';
	import { InputComponent } from '../../Infrastructure/Component';
	import { beforeUpdate, onMount } from 'svelte';
	import type { IInputFieldMetadata } from '../../Infrastructure/uimf';
	import { TypeaheadSourceManager } from './Domain/TypeaheadSourceManager';
	import { ITypeaheadValue } from './Domain/ITypeaheadValue';
	import { IOption, ITypeaheadConfig } from './Domain';

	export let controller: Controller;

	let source: TypeaheadSourceManager;
	let isMounted: boolean = false;

	let component = new InputComponent({
		async init() {
			source = new TypeaheadSourceManager(
				controller.metadata.Component.Configuration,
				controller.form!
			);

			SubscribeToOnChangeEvents();
		},
		async refresh() {
			const capturedValue = controller?.value;

			if (capturedValue != null) {
				let result = await getAugmentedOption(capturedValue);

				if (controller.value?.Value != capturedValue.Value) {
					// The value might have changed once the promise
					// has been resolved. In this case we do nothing, because
					// it would have been taken care of by another invocation.
					return;
				}

				controller.value = result;
			} else {
				controller.value = null;
			}
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	async function getAugmentedOption(value: ITypeaheadValue): Promise<IOption> {
		let options = await source.getOptionsAndFilter(value);

		const option =
			options != null && options.length > 0
				? options.find((t) => t.Value == value?.Value) ?? null
				: null;

		if (option == null) {
			throw `Cannot find option for "${controller.metadata.Id}".`;
		}

		return option;
	}

	async function handleOnFocus(_event: any) {
		await loadOptionsAndFilter('');
	}

	let options: IOption[] = [];

	async function loadOptionsAndFilter(query: string): Promise<IOption[]> {
		if (source == null) return Promise.resolve([]);

		// Two-way update for dropdown items: ensures reactivity by refreshing the options
		// while leveraging the select's loadOptions auto-filtering feature.
		options = await source.getOptionsAndFilter(query);
		return options;
	}

	const groupBy = (item: any) => item.Group;

	function handleChange(_event: any) {
		console.log('on:change event fired on typeahead');
	}

	onMount(() => {
		setTimeout(() => {
			// A typeahead cannot reset another typeahead before it is mounted
			// because this is part of the initial loading process, not a user-triggered change.
			isMounted = true;
		}, 100);
	});

	// Listening for onChange events from all typeahead and dropdown components in the form.
	// If an event is triggered and the current component relies on one of them as a remote source argument,
	// its value is reset.
	function SubscribeToOnChangeEvents() {
		const inputs = controller.form?.inputs
			? Object.values(controller.form.inputs).filter(
					(input) =>
						(input.metadata.Component.Type === 'typeahead' ||
							input.metadata.Component.Type === 'dropdown') &&
						input.metadata.Id !== controller.metadata.Id
			  )
			: [];

		inputs.forEach((component) => {
			component.on('input:change', (event: any) => {
				var currentComponent = controller.metadata.Id;
				var listenedComponent = event.metadata.Id;

				if (listenedComponent === currentComponent) {
					return;
				}

				//console.log('I am ', currentComponent, ' and I detected a change of', listenedComponent);
				var componentWithRemoteArgument =
					controller.metadata?.Component?.Configuration?.Parameters?.some(
						(f: { Source: string | undefined }) => f.Source === event.metadata.Id
					);

				if (componentWithRemoteArgument) {
					if (isMounted) {
						controller.setValue(null);
					}
				}
			});
		});
	}
</script>

<div class="input-container">
	<Select
		value={controller.value}
		label="SearchText"
		itemId="Value"
		required={controller.metadata.Required}
		floatingConfig={{
			// Use fixed strategy to avoid the dropdown being clipped by the parent container.
			strategy: 'fixed'
		}}
		{groupBy}
		createGroupHeaderItem={(group) => ({
			value: group,
			// Because `label="SearchText"` but we are actually using `item.Label`
			// we need to manually set each group item to have `Label` property.
			Label: group
		})}
		on:input={async (e) => {
			if (e.detail?.Value == controller.value?.Value) {
				// Nothing changed. Do nothing. This is important to make sure
				// we don't accidentally set change augmented value for a non-augmented
				// one (which can happen if the typeahead is part of a value list and
				// the row above is removed).
				return;
			}

			await controller.setValue(e.detail);
		}}
		on:clear={async () => {
			await controller?.setValue(null);
		}}
		on:change={handleChange}
		hideEmptyState={true}
		placeholder="type to search..."
		loadOptions={loadOptionsAndFilter}
		items={options}
		on:focus={handleOnFocus}
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
	@import '../../scss/styles.variables.scss';

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

		& > :global(.svelte-select > .svelte-select-list:not(:has(*))) {
			--list-border: none;
		}
	}
</style>
