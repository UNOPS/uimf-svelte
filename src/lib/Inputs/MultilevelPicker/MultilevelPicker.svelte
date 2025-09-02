<script context="module" lang="ts">
	interface Configuration {
		Form: string;
		Parameters?: Array<{
			SourceType: string;
			Parameter: string;
			Source: string;
		}> | null;
	}

	export class Controller extends InputController<Value, IInputFieldMetadata<Configuration>> {
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

	interface IMyOption extends IOption {
		HasChildren: boolean;
		Selectable: boolean;
	}

	interface Response extends FormResponse {
		Items: IMyOption[];
		Path: IMyOption[] | null;
		IsFullSet: boolean;
		ParentId: any | null;
	}
</script>

<script lang="ts">
	import Select from 'svelte-select';
	import { beforeUpdate } from 'svelte';
	import { InputController } from '../../Infrastructure/InputController';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { FormResponse } from '../../Infrastructure/App/FormResponse';
	import type { IInputFieldMetadata } from '$lib/Infrastructure/Metadata';
	import { augmentItems } from '../Typeahead/Typeahead.svelte';
	import type { IOption } from '../Typeahead/Domain/index';
	import { MultilevelPickerCache } from './MultilevelPickerCache';

	export let controller: Controller;

	const emptyOption: IMyOption = {
		Label: '',
		Value: null,
		HasChildren: false,
		Selectable: false,
		SearchText: ''
	};

	let options: IMyOption[] = [];
	let path: IMyOption[] = [];
	let selected: IMyOption = emptyOption;
	let loading = false;
	let listOpen: boolean = false;

	// Create cache instance with component-specific key prefix
	const cache = new MultilevelPickerCache({
		keyPrefix: `multilevel`,
		ttl: 60000
	});

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
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function fetchPath(node: Value | null): Promise<IMyOption[]> {
		if (node?.Value == null) {
			return Promise.resolve([]);
		}

		const source = controller.metadata.Component.Configuration.Form;
		let cacheKey = `${source}#${node.Value.toString()}`;

		loading = true;

		return await cache
			.getItem(cacheKey, async () => {
				var postData = { Id: node.Value };

				await setRequestParameters(postData);

				return controller.app
					.postForm<Response>(controller.metadata.Component.Configuration.Form, postData, null)
					.then((t: any) => {
						return augmentItems(t.Path || []) as IMyOption[];
					})
					.catch(() => {
						return [];
					});
			})
			.finally(() => (loading = false));
	}

	async function fetchPathItems(query?: string | null): Promise<IMyOption[]> {
		let lastItemInPath = path?.length > 0 ? path[path.length - 1] : null;
		let parentId = null;

		if (lastItemInPath != null) {
			if (lastItemInPath.HasChildren) {
				parentId = lastItemInPath.Value;
			} else {
				parentId = path.length > 1 ? path[path.length - 2].Value : null;
			}
		}

		const source = controller.metadata.Component.Configuration.Form;
		let cacheKey = `${source}/${parentId ?? ''}/${query?.trim() ?? ''}`;

		loading = true;

		return await cache
			.getItem(cacheKey, async () => {
				var postData = { Query: query, ParentId: parentId };

				await setRequestParameters(postData);

				return controller.app
					.postForm<Response>(controller.metadata.Component.Configuration.Form, postData, null)
					.then((t: any) => {
						return augmentItems(t.Items) as IMyOption[];
					})
					.catch(() => {
						return [];
					});
			})
			.finally(() => (loading = false));
	}

	function setRequestParameters(postData: any): Promise<any> {
		const parameters = controller.metadata.Component.Configuration.Parameters ?? [];

		let promises = parameters.map((p) => {
			switch (p.SourceType) {
				case 'response':
					postData[p.Parameter] = controller?.form?.response[p.Source]?.value;
					return Promise.resolve();
				case 'request':
					return controller?.form?.inputs[p.Source]
						.getValue()
						.then((value: any) => (postData[p.Parameter] = value));
				case 'path':
					return controller
						.getRelatedFieldByPath(p.Source)!
						.getValue()
						.then((value) => (postData[p.Parameter] = value));
			}
		});

		return Promise.all(promises);
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
		label="SearchText"
		itemId="Value"
		{loading}
		required={controller.metadata.Required}
		floatingConfig={{
			// Use fixed strategy to avoid the dropdown being clipped by the parent container.
			strategy: 'fixed'
		}}
		{listOpen}
		on:select={(e) => controller.setValue(e.detail)}
		on:clear={() => {
			if (selected?.Value != null) {
				controller.setValue(path.length > 1 ? path[path.length - 2].Value : null);
			} else {
				controller.setValue(null);
			}
		}}
		hideEmptyState={false}
		placeholder="type to search..."
		items={options}
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

		& > button {
			cursor: pointer;
			border: none;
			background: transparent;
			padding: 0px 10px;
			font-size: var(--font-size);
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
