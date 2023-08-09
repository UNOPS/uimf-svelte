<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	export interface TypeaheadValue {
		Value: any;
	}

	export class Controller extends InputController<TypeaheadValue> {
		declare items: any[] | null;

		public deserialize(value: string): Promise<TypeaheadValue | null> {
			var result = value == null || value === '' ? null : { Value: value };

			return Promise.resolve(result);
		}

		public serialize(value: TypeaheadValue | null): string {
			return value != null && value.Value != null ? value.Value : null;
		}

		public getValue(): Promise<TypeaheadValue | null> {
			var result = this.value != null && this.value.Value != null ? this.value : null;

			return Promise.resolve(result);
		}

		public async getItems(query: any): Promise<any[] | null> {
			let postData = {
				Query: query
			};

			let response = this.app
				.postForm(this.metadata.CustomProperties.Source, postData, null)
				.then((t: any) => {
					return this.parseResults(t.Items);
				});

			this.items = await response;

			return Promise.resolve(this.items);
		}

		private parseResults(items: any[]): Promise<any[] | null> {
			if (items == null) {
				return Promise.resolve([]);
			}

			// Build "SearchText" field which will be used to find relevant matches.
			items.forEach((c) => (c.SearchText = (c.Value + ' ' + c.Label).toLocaleLowerCase()));
			return Promise.resolve(items);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponentController } from '../Infrastructure/ComponentController';

	export let controller: Controller;

	const search = () => {
		if (searchResultsQuery === userInput) {
			// Don't perform the same search again.
			return searchResults;
		}

		searchResultsQuery = userInput;

		if (userInput.length === 0) {
			searchResults = [];
			controller.setValue(null);
			return;
		}

		controller.getItems(searchResultsQuery).then((items) => {
			searchResults = items?.slice(0, 5) as SearchResult[];
		});
	};

	let inputInFocus: boolean = false;

	let userInput: string = '';
	let searchResults: SearchResult[] = [];
	let searchResultsQuery: string | null = null;

	interface SearchResult {
		SearchText: string;
		Value: number;
	}

	const component = new InputComponentController({
		init() {
			if (controller.value != null) {
				controller.getItems('').then((items) => {
					userInput = items?.filter((item) => item.Value === controller.value?.Value)[0]
						?.SearchText;
				});
			}

			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const handleOnClick = (item: SearchResult) => {
		controller
			.setValue({
				Value: item.Value
			} as TypeaheadValue)
			.then(() => {
				userInput = item.SearchText;
				inputInFocus = false;
			});
	};
</script>

<div
	class="typeahead"
	on:focusin={() => {
		inputInFocus = true;
	}}
	on:focusout={(e) => {
		inputInFocus =
			e.relatedTarget instanceof Element && e.relatedTarget.closest('.typeahead') != null;
	}}
>
	<input
		class="form-control form-control-lg"
		autocomplete="off"
		bind:value={userInput}
		on:input={() => search()}
	/>
	{#if inputInFocus && searchResults?.length > 0}
		<ul class="list-group">
			{#each searchResults as item}
				<button
					class="list-group-item list-group-item-action"
					on:click={() => {
						handleOnClick(item);
					}}>{item.SearchText}</button
				>
			{/each}
		</ul>
	{/if}
</div>

<style lang="scss">
	@import '../../scss/styles.scss';

	.typeahead {
		& > form {
			&:focus-within {
				box-shadow: $input-focus-box-shadow;
				border-color: $input-focus-border-color;
			}
		}
	}

	.list-group {
		position: absolute;
		z-index: 999;
	}
</style>
