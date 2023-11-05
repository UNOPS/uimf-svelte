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

		protected setValueInternal(value: Value | null): Promise<void> {
			return Promise.resolve();
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

	interface Response {
		Items: Option[];
		Path: Option[];
		IsFullSet: boolean;
		ParentId: any | null;
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
		init() {},
		async refresh() {
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
				path.length > 0 && path[path.length - 1].HasChildren ? null : path[path.length - 1];

			let results = await fetchPathItems();

			if (controller.value != capturedValue) {
				// The value might have changed once the promise
				// has been resolved. In this case we do nothing, because
				// it would have been taken care of by another invocation.
				return;
			}

			options = results;

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
			.postForm(controller.metadata.CustomProperties.Form, postData, null)
			.then((t: any) => {
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
		let parentId = path?.length > 0 ? path[path.length - 1].Value : null;
		let cacheKey = `${parentId ?? ''}/${query?.trim() ?? ''}`;

		console.log('fetchItems', cacheKey);

		if (cachedOptions[cacheKey] != null) {
			return cachedOptions[cacheKey];
		}

		var postData = { Query: query, ParentId: parentId };

		await setRequestParameters(postData);

		loading = true;

		cachedOptions[cacheKey] = controller.app
			.postForm(controller.metadata.CustomProperties.Form, postData, null)
			.then((t: any) => {
				if (t.Path != null) {
					// TODO: place this elsewhere.
					path = t.Path;
				}

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
		path = path.slice(0, index);
		controller.value = path.length > 0 ? path[path.length - 1] : null;
		selected = null;
		options = await fetchPathItems();
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
				selected = null;
				options = await fetchPathItems();
			}
		}}
		on:clear={async (e) => {
			controller.value = null;
			path = [];
			selected = null;
			options = await fetchPathItems();
		}}
		hideEmptyState={false}
		placeholder="type to search..."
		items={options}
	/>
</div>

<div>
	value: {JSON.stringify(controller.value)}<br />
	path: {JSON.stringify(path)}<br />
</div>

<style lang="scss">
	@import '../../scss/styles.scss';

	.input-container {
		display: flex;
		align-items: center;
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

		& > :global(.svelte-select.focused) {
			box-shadow: 0 0 0 var(--bs-focus-ring-width) var(--bs-focus-ring-color);
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

		& > span:last-child::after {
			padding-right: 0px;
			content: none;
		}

		& > span::after {
			content: ' / ';
		}
	}
</style>
