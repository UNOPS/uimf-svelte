<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	//export const config = new OutputControlConfiguration(false, false, false, 'multiselect');

	interface MultiselectValue {
		Items: any[];
	}

	export class Controller extends InputController<MultiselectValue> {
		public deserialize(value: string): Promise<MultiselectValue | null> {
			const parsedValue = value ? JSON.parse(value) : null;
			const result: MultiselectValue | null = parsedValue ? { Items: parsedValue } : null;
			return Promise.resolve(result);
		}

		public serialize(value: MultiselectValue): string | null {
			const items = value?.Items?.filter((t) => t !== null && t !== undefined) || [];
			return JSON.stringify(items.length > 0 ? items : null);
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
	import { InputComponentController } from '../Infrastructure/ComponentController';

	export let controller: Controller;

	let items: any[];
	let sourceFormId: string;
	let cachedOptions: Record<string, Promise<any>> = {};
	let selected: any[];
	let isInlineSource: boolean = true;

	let component = new InputComponentController({
		async init() {
			console.log('init multi select');
			cachedOptions = {};
			selected = [];

			let source = controller.metadata.CustomProperties.Source;
			isInlineSource = typeof source !== 'string';
			items = isInlineSource ? augmentItems(source) : [];
			sourceFormId = isInlineSource ? null : source;

			controller.ready?.resolve();
		},
		// component must be refreshed to take url data in account
		async refresh() {
			setComponentValue();
		},
		async refreshBrowser() {
			setComponentValue();
		}
	});

	async function setComponentValue() {
		if (controller?.value && controller.serialize(controller.value)) {
			let results = await loadOptions(controller.value);
			selected =
				results?.length > 0
					? controller.value.Items.map((t) => results.find((c: { Value: any; }) => c.Value == t))
					: [];
		} else {
			selected = [];
			controller.value = null;
		}
	}

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	component.clearAction = function (value: any): void {
		if (value == null) {
			selected = [];
		}
	};

	function augmentItems(items: any[]): any[] {
		if (items == null) {
			return [];
		}

		if (!Array.isArray(items)) {
			return [];
		}

		// Build "SearchText" field which will be used to find relevant matches.
		items.forEach((c) => (c.SearchText = (c.Value + ' ' + c.Label).toLocaleLowerCase()));
		return items;
	}

	async function loadOptionsAndFilter(query: MultiselectValue | string): Promise<any> {
		const queryById = typeof query !== 'string';

		return loadOptions(query).then((options) => {
			if (queryById) {
				return options;
			}

			const queryInLowercase = query.toLocaleLowerCase();

			return options.filter((t: { SearchText: string | string[] }) =>
				t.SearchText.includes(queryInLowercase)
			);
		});
	}

	async function loadOptions(query: MultiselectValue | string): Promise<any> {
		if (isInlineSource) {
			return Promise.resolve(items);
		}

		if (typeof query === 'string') {
			if (cachedOptions[query] != null) {
				return cachedOptions[query];
			}
		}

		var postData =
			typeof query === 'string'
				? { Query: query }
				: { Ids: { Items: query.Items?.length > 0 ? query.Items : [] } };

		const parameters: any[] = controller.metadata.CustomProperties['Parameters'];

		if (parameters !== null) {
			let promises = parameters.map((p) => {
				switch (p.SourceType) {
					case 'response':
						// Use type assertion here
						(postData as any)[p.Parameter] = controller?.form?.response[p.Source];
						return Promise.resolve();
					case 'request':
						return controller?.form?.inputs[p.Source]
							.getValue()
							.then((value) => ((postData as any)[p.Parameter] = value));
				}
			});

			await Promise.all(promises);
		}

		let response = controller.app
			.postForm(controller.metadata.CustomProperties.Source, postData, null)
			.then((t: any) => {
				return augmentItems(t.Items);
			});

		if (typeof query === 'string') {
			cachedOptions[query] = response;
		}

		return await response;
	}

	async function handleSelect(event: { detail: string | any[] | null }) {
		if (event.detail != null && event.detail.length > 0) {
			selected = selected || [];
			selected.push(...event.detail);

			if (controller.value == null) {
				controller.value = { Items: [] };
			}

			controller.value.Items =
				selected.length > 0 ? [...new Set(selected.map((t) => t.Value))] : [];
		}
	}
</script>

<div class="input-container">
	<Select
		{items}
		value={selected}
		label="Label"
		itemId="Value"
		on:input={handleSelect}
		on:clear={() => {
			if (controller != null) {
				controller.value = null;
			}
			selected = [];
		}}
		multiple={true}
		hideEmptyState={true}
		placeholder="type to search..."
		loadOptions={loadOptionsAndFilter}
	/>
</div>

<style lang="scss">
	.input-container {
		width: 100%;
		--height: 37px;
		--padding: 0 16px 0 16px;
		--background: var(--app-body-bg);
		--input-color: var(--app-body-color);
		--font-size: 1rem;
		--item-height: auto;

		--item-color: var(--app-body-color);
		--item-hover-bg: var(--app-tertiary-bg);

		--clear-icon-color: var(--app-body-color);
		--clear-select-width: 20px;
		--loading-width: 20px;

		--list-background: var(--app-body-bg);
		--list-border: 1px solid var(--app-border-color);

		--border: 1px solid var(--app-border-color);
		--border-hover: 1px solid var(--app-border-color);
		--border-focused: 1px solid var(--app-input-focus-border-color);

		--multi-item-bg: var(--app-body-bg);
		--multi-select-padding: 0 16px 0 16px;
		--multi-item-height: 28px;
		--multi-item-clear-icon-color: var(--app-body-color);
		--multi-item-outline: 2px solid var(--app-border-color);

		& > :global(.svelte-select.focused) {
			box-shadow: 0 0 0 var(--app-focus-ring-width) var(--app-focus-ring-color);
		}
	}
</style>
