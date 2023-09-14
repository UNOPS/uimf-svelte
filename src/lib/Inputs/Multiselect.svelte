<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';

	export interface MultiSelectValue {
		Items: any[];
	}

	export interface SearchResult {
		SearchText: string;
		Value: number;
	}

	export class Controller extends InputController<MultiSelectValue> {
		declare items: any[] | null;
		public declare selectedValues: SearchResult[] | null;

		public deserialize(value: string): Promise<MultiSelectValue | null> {
			var result = value == null || value === '' ? null : { Items: JSON.parse(value) };

			return Promise.resolve(result);
		}

		public serialize(value: MultiSelectValue | null): string {
			return JSON.stringify(value != null && value.Items != null ? value.Items : null);
		}

		public getValue(): Promise<MultiSelectValue | null> {
			var result = this.value != null && this.value.Items != null ? this.value : null;

			return Promise.resolve(result);
		}

		public async getItems(query: any): Promise<any[] | null> {

			if(this.items != null){
				this.items = await this.parseResults(this.items.filter((item: any) => item.Label.contains(query)));
				return Promise.resolve(this.items);
			}
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

		private parseResults(items: any[]): Promise<SearchResult[] | null> {
			if (items == null) {
				return Promise.resolve([]);
			}

			// Build "SearchText" field which will be used to find relevant matches.
			items.forEach((c) => (c.SearchText = (c.Value + ' ' + c.Label).toLocaleLowerCase()));
			return Promise.resolve(items);
		}

		public setSelectedValue(items: SearchResult[]): Promise<void> {
			this.selectedValues = items;
			return Promise.resolve();
		}

		protected setValueInternal(value: MultiSelectValue | null): Promise<void> {
			if (
				value != null &&
				value.Items != null &&
				(this.selectedValues == null || this.selectedValues.length === 0)
			) {
				return this.getItems('').then((items) => {
					this.selectedValues =
						items == null
							? []
							: items.filter((item) => this.value?.Items.some((v) => v === item.Value));
					return Promise.resolve();
				});
			} 
			else if(value == null){
				this.selectedValues = [];
				return Promise.resolve();
			}
			else {
				return Promise.resolve();
			}
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

	const component = new InputComponentController({
		init() {
			controller.selectedValues = [];
			controller.ready?.resolve();
		},
		refresh() {
			controller.selectedValues = controller.selectedValues;
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const handleOnClick = (item: SearchResult) => {
		let selectedValues = controller.selectedValues!;
		if (selectedValues.find((c) => c.Value === item.Value) == null) {
			selectedValues = [...selectedValues, item];
			controller.setSelectedValue(selectedValues);
			controller.setValue({ Items: selectedValues.map((t) => t.Value) });
		}
		userInput = '';
		inputInFocus = false;
		searchResults = [];
	};

	const handleRemove = (item: SearchResult) => {
		let selectedValues = controller.selectedValues!;
		selectedValues = selectedValues.filter((c) => c.Value !== item.Value);
		controller.setSelectedValue(selectedValues);
		controller.setValue({ Items: selectedValues.map((t) => t.Value) });
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
	<div class="selected-values">
		{#each controller.selectedValues ?? [] as item}
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-primary">{item.SearchText}</button>
				<button
					type="button"
					class="btn btn-secondary"
					on:click={() => {
						handleRemove(item);
					}}><i class="fa fa-times" /></button
				>
			</div>
		{/each}
	</div>
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

	.selected-values {
		display: flex;
		flex-direction: row;
		gap: 10px;
		padding-bottom: 15px;
	}

	.btn-primary {
		color: white;
	}

	.btn-primary:hover {
		color: white;
	}
</style>
