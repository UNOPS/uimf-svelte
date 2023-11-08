<script context="module" lang="ts">
	export class Controller extends InputController<Value> {
		public deserialize(value: string): Promise<Value | null> {
			var result = value == null || value === '' ? null : { Value: value };
			return Promise.resolve(result);
		}

		public serialize(value: Value | null): string | null {
			return value != null && value.Value != null ? value.Value : null;
		}

		public getValue(): Promise<Value | null> {
			var result = this.value != null && this.value.Value != null ? this.value : null;

			return Promise.resolve(result);
		}
	}

	interface Value {
		Value: any | null;
	}

	interface Option {
		Value: any;
		Label: string;
		HasChildren: boolean;
		Selectable: boolean;
	}

	interface Response extends FormResponse {
		Items: Option[];
		Path: Option[] | null;
		IsFullSet: boolean;
		ParentId: any | null;
	}
</script>

<script lang="ts">
	import Select from 'svelte-select';
	import { beforeUpdate } from 'svelte';
	import { InputController } from '../Infrastructure/InputController';
	import { InputComponent } from '../Infrastructure/Component';
	import type { FormResponse } from '../Infrastructure/UimfApp';

	export let controller: Controller;

	const emptyOption: Option = {
		Label: '',
		Value: null,
		HasChildren: false,
		Selectable: false
	};

	let options: Option[] = [];
	let cachedOptions: Record<string, Promise<any>> = {};
	let path: Option[] = [];
	let selected: Option = emptyOption;
	let loading = true;
	let listOpen: boolean = false;

	const component = new InputComponent({
		init() {},
		async refresh() {
			// We need to set this to false, because otherwise this
			// variable will stay true forever and won't be taken
			// into account by `svelte-select` component.
			listOpen = false;

			const capturedValue = controller.value;

			// Always create a copy of the original array.
			path = Array.from(await fetchPath(capturedValue));

			if (controller.value != capturedValue) {
				// The value might have changed once the promise
				// has been resolved. In this case we do nothing, because
				// it would have been taken care of by another invocation.
				return;
			}

			// Only select the item if it has no children.
			selected =
				path.length > 0 && path[path.length - 1].HasChildren ? emptyOption : path[path.length - 1];

			let results = await fetchPathItems();

			if (controller.value != capturedValue) {
				// The value might have changed once the promise
				// has been resolved. In this case we do nothing, because
				// it would have been taken care of by another invocation.
				return;
			}

			options = results;
			controller.value = controller.value;

			if (controller.value != null && selected == null) {
				throw `Cannot find option for "${controller.metadata.Id}".`;
			}

			controller.ready?.resolve();
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function fetchPath(node: Value | null): Promise<Option[]> {
		if (node?.Value == null) {
			return Promise.resolve([]);
		}

		let cacheKey = '#' + node.Value.toString();

		if (cachedOptions[cacheKey] != null) {
			return cachedOptions[cacheKey];
		}

		var postData = { Id: node.Value };

		await setRequestParameters(postData);

		cachedOptions[cacheKey] = controller.app
			.postForm<Response>(controller.metadata.CustomProperties.Form, postData, null)
			.then((t) => {
				loading = false;
				return t.Path ?? [];
			})
			.catch(() => {
				loading = false;
				return [];
			});

		return await cachedOptions[cacheKey];
	}

	async function fetchPathItems(query?: string | null): Promise<Option[]> {
		let lastItemInPath = path?.length > 0 ? path[path.length - 1] : null;
		let parentId = null;

		if (lastItemInPath != null) {
			if (lastItemInPath.HasChildren) {
				parentId = lastItemInPath.Value;
			} else {
				parentId = path.length > 1 ? path[path.length - 2].Value : null;
			}
		}

		let cacheKey = `${parentId ?? ''}/${query?.trim() ?? ''}`;

		if (cachedOptions[cacheKey] != null) {
			return cachedOptions[cacheKey];
		}

		var postData = { Query: query, ParentId: parentId };

		await setRequestParameters(postData);

		loading = true;

		cachedOptions[cacheKey] = controller.app
			.postForm<Response>(controller.metadata.CustomProperties.Form, postData, null)
			.then((t) => {
				loading = false;
				return t.Items ?? [];
			})
			.catch(() => {
				loading = false;
				return [];
			});

		return await cachedOptions[cacheKey];
	}

	function setRequestParameters(postData: any): Promise<any> {
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

			return Promise.all(promises);
		}

		return Promise.resolve();
	}

	async function selectItem(index: number) {
		// Select the item before the one that was clicked. We do this
		// because by clicking a particular item user indicates that they
		// want to replace it with a new one. So the actual value we should
		// set to is the item before the one that was clicked.
		let value = index > 0 ? path[index - 1].Value : null;
		await controller.setValue(value);

		// Open the list of options so that user does not need to click
		// again to open it.
		listOpen = true;
	}
</script>

<div class="input-container">
	{#if path?.length > 0}
		{#each path as node, index}
			{#if node.HasChildren}
				<button
					type="button"
					on:click={async () => selectItem(index)}
					on:keypress={async () => selectItem(index)}>{node.Label}</button
				>
				<i>&raquo;</i>
			{/if}
		{/each}
	{/if}

	<Select
		value={selected}
		label="Label"
		itemId="Value"
		{loading}
		required={controller.metadata.Required}
		{listOpen}
		on:select={(e) => controller.setValue(e.detail)}
		on:clear={(e) => {
			if (selected?.Value != null) {
				controller.setValue(path.length > 1 ? path[path.length - 2].Value : null);
			} else {
				controller.setValue(null);
			}
		}}
		hideEmptyState={false}
		placeholder="type to search..."
		items={options}
	/>
</div>

<style lang="scss">
	@import '../../scss/styles.scss';

	.input-container {
		display: flex;
		flex-wrap: wrap;
		gap: 5px 0;
		align-items: stretch;
		width: 100%;
		border: 1px solid var(--bs-border-color);

		& > :global(.svelte-select) {
			flex-grow: 2;
		}

		--width: auto;
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

		--border: 0px solid var(--bs-border-color);
		--border-hover: 0px solid var(--bs-border-color);
		--border-focused: 0px solid #{$input-focus-border-color};
		--border-radius: 0;

		--multi-item-bg: var(--bs-body-bg);
		--multi-select-padding: var(--padding);
		--multi-item-height: 25px;
		--multi-item-clear-icon-color: var(--bs-body-color);
		--multi-item-outline: 1px solid var(--bs-border-color);
		--multi-select-input-margin: 0 0;

		& > :global(.svelte-select.focused) {
			box-shadow: 0 0 0 var(--bs-focus-ring-width) var(--bs-focus-ring-color);
		}

		& > button {
			cursor: pointer;
			border: none;
			background: transparent;
			padding: 0px 10px;
			font-size: var(--bs-body-font-size);
		}

		& > i {
			line-height: 1.9em;
			font-size: 1.5em;
			padding: 0 4px 0 4px;
		}

		& > * {
			height: #{$app-input-min-height};
		}
	}
</style>
