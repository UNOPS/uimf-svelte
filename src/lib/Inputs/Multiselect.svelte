<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

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
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let items: any[];
	let cachedOptions: Record<string, Promise<any>> = {};
	let selected: any[];
	let isInlineSource: boolean = true;

	let component = new InputComponent({
		async init() {
			cachedOptions = {};
			selected = [];

			let source = controller.metadata.CustomProperties.Source;
			isInlineSource = typeof source !== 'string';
			items = isInlineSource ? augmentItems(source) : [];

			controller.ready?.resolve();
		},
		async refresh() {
			var capturedValue = controller?.value;
			if (capturedValue != null && controller.serialize(capturedValue)) {
				let results = await loadOptions(capturedValue);

				if (controller.value != capturedValue) {
					// The value might have changed once the promise
					// has been resolved. In this case we do nothing, because
					// it would have been taken care of by another invocation.
					return;
				}

				selected =
					results?.length > 0
						? controller.value.Items.map((t) => results.find((c: { Value: any }) => c.Value == t))
						: [];
			} else {
				selected = [];
				controller.value = null;
			}
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

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
						(postData as any)[p.Parameter] = controller?.form?.response[p.Source]?.value;
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

	async function handleSelect(event: Event & { detail: any[] }) {
		if (event.detail != null && event.detail.length > 0) {
			selected = selected || [];
			selected.push(...event.detail);

			const items = selected.length > 0 ? [...new Set(selected.map((t) => t.Value))] : [];

			controller.setValue({ Items: items });
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
			controller?.setValue(null);
			selected = [];
		}}
		multiple={true}
		hideEmptyState={true}
		placeholder="type to search..."
		loadOptions={loadOptionsAndFilter}
	/>
</div>

<style lang="scss">
	@import '../../scss/styles.scss';
	
	.input-container {
		width: 100%;
		--height: #{$app-input-min-height};
		--padding: 0 10px 0 10px;
		--background: var(--bs-body-bg);
		--input-color: var(--bs-body-color);
		--font-size: var(--bs-body-font-size);

		--item-height: auto;
		--item-color: var(--bs-body-color);
		--item-hover-color: var(--bs-body-color);
		--item-hover-bg: var(--bs-tertiary-bg);
		--item-is-active-bg: var(--bs-primary-bg-subtle);
		--item-is-active-color: var(--bs-body-color);
		--item-line-height: #{$app-input-min-height};

		--clear-icon-color: var(--bs-body-color);
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
		--multi-select-padding: 0 10px 0 10px;
		--multi-item-height: 25px;
		--multi-item-clear-icon-color: var(--bs-body-color);
		--multi-item-outline: 2px solid var(--bs-border-color);

		.item {
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
