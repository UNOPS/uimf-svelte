<script context="module" lang="ts">
	export class Controller extends InputController<MultilevelPickerValue> {
		public deserialize(value: string): Promise<MultilevelPickerValue | null> {
			var result = value == null || value === '' ? null : new MultilevelPickerValue(value);
			return Promise.resolve(result);
		}

		public serialize(value: MultilevelPickerValue | null): string | null {
			return value != null && value.Value != null ? value.Value : null;
		}

		public getValue(): Promise<MultilevelPickerValue | null> {
			var result = this.value != null && this.value.Value != null ? this.value : null;

			return Promise.resolve(result);
		}

		protected setValueInternal(value: MultilevelPickerValue | null): Promise<void> {
			return Promise.resolve();
		}
	}

	// tslint:disable-next-line:max-classes-per-file
	class MultilevelPickerValue {
		constructor(value?: any) {
			this.Value = value;
		}

		public Value: any;
	}

	interface Option {
		Value: any;
		Label: string;
		HasChildren?: boolean;
		SearchText: string;
	}
</script>

<script lang="ts">
	import Select from 'svelte-select';
	import { beforeUpdate } from 'svelte';
	import { InputController } from '../Infrastructure/InputController';
	import { InputComponent } from '../Infrastructure/Component';

	export let controller: Controller;

	let options: Option[] = [];
	let cachedOptions: Record<string, Promise<any>> = {};
	let path: Option[] = [];
	let selected: Option | null = null;
	let loading = true;

	const component = new InputComponent({
		init() {
			controller.ready?.resolve();
		},
		async refresh() {
			const capturedValue = controller.value;

			const results = await fetchItems(capturedValue);

			if (controller.value != capturedValue) {
				// The value might have changed once the promise
				// has been resolved. In this case we do nothing, because
				// it would have been taken care of by another invocation.
				return;
			}

			options = results;

			selected =
				controller.value != null && options?.length > 0
					? options.find((t) => t.Value == controller.value?.Value) ?? null
					: null;

			if (controller.value != null && selected == null) {
				throw `Cannot find option for "${controller.metadata.Id}".`;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function fetchItems(query?: MultilevelPickerValue | string | null): Promise<Option[]> {
		const normalizedQuery = typeof query === 'string' ? query?.trim() : query;

		let cacheKey =
			typeof normalizedQuery === 'object' && normalizedQuery != null
				? normalizedQuery.Value
				: normalizedQuery;

		cacheKey =
			[controller?.value?.Value, cacheKey].filter((t) => t?.toString().length > 0).join('/') ??
			null;

		console.log('fetchItems', cacheKey, cachedOptions[cacheKey]);

		if (cachedOptions[cacheKey] != null) {
			return cachedOptions[cacheKey];
		}

		type PostData =
			| { Id: any; [unknown: string]: any }
			| { Query?: string | null; ParentId: any; [unknown: string]: any };

		var postData: PostData =
			typeof normalizedQuery === 'object' && normalizedQuery != null
				? { Id: normalizedQuery.Value }
				: { Query: normalizedQuery, ParentId: controller?.value?.Value };

		const parameters: any[] = controller.metadata.CustomProperties?.Parameters;

		if (parameters != null) {
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

		loading = true;

		cachedOptions[cacheKey] = controller.app
			.postForm(controller.metadata.CustomProperties.Form, postData, null)
			.then((t: any) => {
				if (t.Path != null) {
					// TODO: place this elsewhere.
					path = t.Path;
				}

				loading = false;
				return augmentItems(t.Items);
			})
			.catch(() => {
				loading = false;
				return [];
			});

		return await cachedOptions[cacheKey];
	}

	function augmentItems(items: Option[]): Option[] {
		if (items == null) {
			return [];
		}

		// Build "SearchText" field which will be used to find relevant matches.
		items.forEach((c) => (c.SearchText = (c.Value + ' ' + c.Label).toLocaleLowerCase()));
		return items;
	}

	async function reloadItems() {
		selected = null;
		options = await fetchItems();
	}

	async function selectItem(index: number) {
		path = path.slice(0, index);
		controller.value = path.length > 0 ? path[path.length - 1] : null;
		await reloadItems();
	}
</script>

<div class="input-container">
	{#if path?.length > 0}
		<div class="path">
			{#each path as node, index}
				{#if node.HasChildren}
					<span>
						<button
							on:click={async () => selectItem(index)}
							on:keypress={async () => selectItem(index)}>{node.Label}</button
						>
					</span>
				{/if}
			{/each}
		</div>
	{/if}

	<Select
		value={selected}
		label="Label"
		itemId="Value"
		{loading}
		required={controller.metadata.Required}
		on:select={async (e) => {
			if (controller.value?.Value == e.detail.Value) {
				// The value is already selected. Do nothing.
				return;
			}

			controller.value = e.detail;

			path.push(e.detail);
			path = path;

			if (e.detail.HasChildren) {
				await reloadItems();
			}
		}}
		on:clear={async (e) => {
			controller.value = null;
			path = [];
			await reloadItems();
		}}
		hideEmptyState={false}
		placeholder="type to search..."
		items={options}
	/>

	{JSON.stringify(controller.value)}
</div>

<style lang="scss">
	.input-container {
		display: flex;
		align-items: center;
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

	.path {
		white-space: nowrap;
		flex-grow: 1;
		margin-right: 10px;

		& > span > span {
			text-decoration: underline;
			cursor: pointer;
		}

		& > span:last-child {
			padding-right: 0px;
		}

		& > span::after {
			content: ' / ';
		}
	}
</style>
