<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	export class Controller extends InputController<TypeaheadValue> {
		public deserialize(value: string): Promise<TypeaheadValue | null> {
			var result = value == null || value === '' ? null : new TypeaheadValue(value);

			return Promise.resolve(result);
		}

		public serialize(value: TypeaheadValue): string {
			return value != null && value.Value != null ? value.Value : null;
		}

		public getValue(): Promise<TypeaheadValue | null> {
			var result = this.value != null && this.value.Value != null ? this.value : null;

			return Promise.resolve(result);
		}

		protected setValueInternal(value: TypeaheadValue): Promise<void> {
			return Promise.resolve();
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
	import { InputComponentController } from '../Infrastructure/ComponentController';
	import { beforeUpdate } from 'svelte';

	export let controller: Controller;

	let id: string;
	let items: any[];
	let sourceFormId: string;
	let cachedOptions: Record<string, Promise<any>> = {};
	let isInlineSource: boolean = true;

	let selected: any;

	let component = new InputComponentController({
		init() {
			cachedOptions = {};

			let source = controller.metadata.CustomProperties.Source;
			isInlineSource = typeof source !== 'string';
			items = isInlineSource ? augmentItems(source) : [];
			sourceFormId = isInlineSource ? null : source;

			controller.ready?.resolve();
		},
		async refreshBrowser() {
			if (controller.value != null && controller.serialize(controller.value) != null) {
				let results = await loadOptions(controller.value);
				controller.value =
					results != null && results.length > 0
						? results.find((t: { Value: any }) => t.Value == controller?.value?.Value)
						: null;

				if (controller.value == null) {
					throw `Cannot find option for "${controller.metadata.Id}".`;
				}
			} else {
				controller.value = null;
			}

			// Firing `changed` from `refreshBrowser` is not possible, because
			// it would result in an infinite recursion because `refreshBrowser`
			// is auto-invoked on `changed` event. However, we still need to signal
			// the fact that typeahead now has a value, so we trigger `refreshed` event.
			controller.fire('refreshed', controller.value);
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	$: {
		selected = controller.value;
	}

	component.clearAction = function (value: any): void {
		if (value == null) {
			selected = null;
		}
	};

	function augmentItems(items: any[]): any[] {
		if (items == null) {
			return [];
		}

		// Build "SearchText" field which will be used to find relevant matches.
		items.forEach((c) => (c.SearchText = (c.Value + ' ' + c.Label).toLocaleLowerCase()));
		return items;
	}

	async function loadOptionsAndFilter(query: string): Promise<any> {
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

	async function loadOptions(query: string | TypeaheadValue | null): Promise<any> {
		if (isInlineSource) {
			return Promise.resolve(items);
		}

		let cacheKey = typeof query === 'object' && query != null ? query.Value : query;

		if (cachedOptions[cacheKey] != null) {
			return cachedOptions[cacheKey];
		}

		type PostData = { Ids: { Items: any[] } } | { Query: string | null };

		let postData: PostData =
			typeof query === 'object' && query !== null
				? { Ids: { Items: [query.Value] } }
				: { Query: query };

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

		return await response;
	}
</script>

<div class="input-container">
	<Select
		inputAttributes={{ id: id, tabindex: 0 }}
		value={selected}
		label="Label"
		itemId="Value"
		on:input={(e) => {
			controller.value = e.detail;
			controller.fire('changed', e.detail);
		}}
		on:clear={() => {
			if (controller != null) {
				controller.value = null;
				controller.fire('changed', null);
			}
		}}
		hideEmptyState={true}
		placeholder="type to search..."
		loadOptions={loadOptionsAndFilter}
	>
		<div slot="item" let:item class="item">
			{#if item.Path != null}
				<small>{item.Path}</small>
				<span>{@html item.Label}</span>
			{:else}
				{@html item.Label}
			{/if}
		</div>
	</Select>
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

		.item {
			cursor: default;
			line-height: var(--height, 42px);
			color: var(--item-color, inherit);
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;

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
			box-shadow: 0 0 0 var(--app-focus-ring-width) var(--app-focus-ring-color);
		}
	}
</style>
