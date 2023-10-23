<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	interface MultiselectValue {
		Items: any[];
	}

	export class Controller extends InputController<MultiselectValue> {
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

	interface Option {
		Label: string;
		Value: any;
		RequiredPermission: string;
		Group: string;
		SearchText: string;
	}

	export let controller: Controller;

	let inlineItems: Option[] | null = null;
	let cachedOptions: Record<string, Promise<Option[]>> = {};
	let selected: Option[] = [];

	let component = new InputComponent({
		async init() {
			cachedOptions = {};
			selected = [];

			let source = controller.metadata.CustomProperties.Source;
			inlineItems = Array.isArray(source) ? augmentItems(source) : [];

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
						? controller.value.Items.map((t) => results.find((c) => c.Value == t)!)
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

	function augmentItems(items: Option[]): Option[] {
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
			const visibleOptions = options.filter((t) =>
				controller.app.hasPermission(t.RequiredPermission)
			);

			if (queryById) {
				return visibleOptions;
			}

			const queryInLowercase = query.toLocaleLowerCase();

			return visibleOptions.filter((t) => t.SearchText.includes(queryInLowercase));
		});
	}

	async function loadOptions(query: MultiselectValue | string): Promise<Option[]> {
		if (inlineItems != null) {
			return Promise.resolve(inlineItems);
		}

		if (typeof query === 'string') {
			if (cachedOptions[query] != null) {
				return cachedOptions[query];
			}
		}

		type PostData =
			| { Ids: { Items: any[] }; [unknown: string]: any }
			| { Query: string | null; [unknown: string]: any };

		var postData: PostData =
			typeof query === 'string'
				? { Query: query }
				: { Ids: { Items: query.Items?.length > 0 ? query.Items : [] } };

		const parameters: any[] = controller.metadata.CustomProperties['Parameters'];

		if (parameters !== null) {
			let promises = parameters.map((p) => {
				switch (p.SourceType) {
					case 'response':
						postData[p.Parameter] = controller?.form?.response[p.Source]?.value;
						return Promise.resolve();
					case 'request':
						return controller?.form?.inputs[p.Source]
							.getValue()
							.then((value) => (postData[p.Parameter] = value));
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

	const groupBy = (item: any) => item.Group;
</script>

<div class="input-container">
	<Select
		value={selected}
		label="Label"
		itemId="Value"
		required={controller.metadata.Required}
		{groupBy}
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
	</Select>
</div>

<style lang="scss">
	@import '../../scss/styles.scss';

	.input-container {
		width: 100%;
		--height: #{$app-input-min-height};
		--padding: 0 6px 0 10px;
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
