<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	export interface TypeaheadItem extends TypeaheadValue {
		Label: string;
	}

	export interface TypeaheadMetadata extends ComponentMetadata {
		DefaultValue: any;
		CustomProperties: {
			Source: string;
			Parameters?: Array<{
				SourceType: string;
				Parameter: string;
				Source: string;
			}> | null;
			Items: Array<TypeaheadItem>;
		};
	}

	export class Controller extends InputController<TypeaheadValue, TypeaheadMetadata> {
		public getValue(): Promise<TypeaheadValue | null> {
			var result = this.value?.Value != null ? this.value : null;

			return Promise.resolve(result);
		}

		public deserialize(value: string | null): Promise<TypeaheadValue | null> {
			var result = value == null || value === '' ? null : new TypeaheadValue(value);

			return Promise.resolve(result);
		}

		public serialize(value: TypeaheadValue | null): string | null {
			return value?.Value != null ? value.Value : null;
		}
	}

	// tslint:disable-next-line:max-classes-per-file
	class TypeaheadValue {
		constructor(value?: any) {
			this.Value = value;
		}

		public Value: any;
	}
</script>

<script lang="ts">
	import Select from 'svelte-select';
	import { InputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	interface Option extends TypeaheadValue {
		Label: string;
		Value: any;
		RequiredPermission: string;
		Group: string;
		SearchText: string;
	}

	export let controller: Controller;

	let inlineItems: Option[] | null = null;
	let cachedOptions: Record<string, Promise<Option[]>> = {};

	let component = new InputComponent({
		init() {
			cachedOptions = {};

			const source = controller.metadata.CustomProperties.Items;
			inlineItems = Array.isArray(source) ? augmentItems(source) : null;

			controller.ready?.resolve();

			if (controller.value == null || controller.value.Value == '' || controller.value.Value == null) {
				var valueName =
					controller.metadata.DefaultValue != null && controller.form?.hasOriginalInputValues() !== true
						? controller.metadata.DefaultValue
						: null;

				var index;

				if (valueName !== null) {
					index = controller.app.getDefaultValue(valueName);
				}

				controller.value = { Value: index };
			}
		},
		async refresh() {
			const capturedValue = controller.value;

			if (capturedValue != null && controller.serialize(capturedValue) != null) {
				let results = await loadOptions(capturedValue);

				if (controller.value != capturedValue) {
					// The value might have changed once the promise
					// has been resolved. In this case we do nothing, because
					// it would have been taken care of by another invocation.
					return;
				}

				controller.value =
					results != null && results.length > 0
						? results.find((t) => t.Value == controller?.value?.Value) ?? null
						: null;

				if (controller.value == null) {
					throw `Cannot find option for "${controller.metadata.Id}".`;
				}
			} else {
				controller.value = null;
			}
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	function augmentItems(items: TypeaheadItem[]): Option[] {
		if (items == null) {
			return [];
		}

		return items.map((c) => {
			return {
				...c,
				// Build "SearchText" field which will be used to find relevant matches.
				SearchText: (c.Value + ' ' + c.Label).toLocaleLowerCase()
			} as Option;
		});
	}

	async function loadOptionsAndFilter(query: string): Promise<Option[]> {
		const queryById = typeof query !== 'string';

		return loadOptions(query).then((options) => {
			const visibleOptions = options.filter((t) =>
				controller.app.hasPermission(t.RequiredPermission)
			);

			if (queryById) {
				return visibleOptions;
			}

			const queryInLowercase = query.toLocaleLowerCase();

			return visibleOptions.filter((t: { SearchText: string | string[] }) =>
				t.SearchText.includes(queryInLowercase)
			);
		});
	}

	async function loadOptions(query: string | TypeaheadValue | null): Promise<Option[]> {
		if (inlineItems != null) {
			return Promise.resolve(inlineItems);
		}

		let cacheKey = typeof query === 'object' && query != null ? query.Value : query;

		if (cachedOptions[cacheKey] != null) {
			return cachedOptions[cacheKey];
		}

		type PostData =
			| { Ids: { Items: any[] }; [unknown: string]: any }
			| { Query: string | null; [unknown: string]: any };

		let postData: PostData =
			typeof query === 'object' && query !== null
				? { Ids: { Items: [query.Value] } }
				: { Query: query };

		const parameters = controller.metadata.CustomProperties.Parameters;

		if (parameters != null) {
			let promises = parameters.map((p) => {
				switch (p.SourceType) {
					case 'response':
						postData[p.Parameter] = controller?.form?.response[p.Source]?.value;
						return Promise.resolve();
					case 'request':
						return controller?.form?.inputs[p.Source]
							.getValue()
							.then((value: any) => (postData[p.Parameter] = value));
				}
			});

			await Promise.all(promises);
		}

		let response = controller.app
			.postForm(controller.metadata.CustomProperties.Source, postData, null)
			.then((t: any) => {
				return augmentItems(t.Items);
			});

		return await response;
	}

	const groupBy = (item: any) => item.Group;
</script>

<div class="input-container">
	<Select
		value={controller.value}
		label="Label"
		itemId="Value"
		required={controller.metadata.Required}
		{groupBy}
		on:input={async (e) => {
			await controller.setValue(e.detail);
		}}
		on:clear={async () => {
			await controller?.setValue(null);
		}}
		hideEmptyState={true}
		placeholder="type to search..."
		loadOptions={loadOptionsAndFilter}
	>
		<div slot="item" let:item class={item.CssClass} class:item-slot={true}>
			{@html item.Label}
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
			&.inactive {
				opacity: 0.5;
			}

			& > small {
				font-size: 0.8em;
				display: block;
				opacity: 0.5;
				line-height: 1.2em;
				padding: 8px 0 0 0;
			}

			& > span {
				line-height: 1.8em;
				padding: 0 0 5px 0;
				margin: 0;
				display: block;
			}
		}

		& > :global(.svelte-select.focused) {
			box-shadow: 0 0 0 var(--bs-focus-ring-width) var(--bs-focus-ring-color);
		}
	}
</style>
