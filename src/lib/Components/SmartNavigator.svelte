<script lang="ts">
	import type {
		FormMetadata,
		IInputFieldMetadata,
		SmartNavigatorCustomProperty
	} from '../Infrastructure/Metadata';

	export let formMetadatas: Array<FormMetadata> = [];
	let forms: SmartNavEntry[] = [];
	let navigatorInputElement: HTMLInputElement | undefined = undefined;
	let navigatorInFocus: boolean = false;

	let userInput: string = '';
	let searchResults: Array<SearchResult> = [];
	let searchResultsQuery: string | null = null;
	let activeSearchResultIndex: number = 0;

	class SmartNavEntry {
		Metadata: FormMetadata;
		SmartNav: SmartNavigatorCustomProperty;
		EffectiveLabel: string;
		RequiredInput: IInputFieldMetadata | null;
		SearchText: string;

		constructor(form: FormMetadata) {
			this.Metadata = form;
			this.SmartNav = form.CustomProperties!.SmartNavigator!;
			this.EffectiveLabel = form.CustomProperties?.SmartNavigator?.Label ?? form.Label;

			this.SearchText = (
				form.CustomProperties?.SmartNavigator?.Label ?? form.Label
			).toLocaleLowerCase();

			this.RequiredInput =
				this.SmartNav.RequiredInput != null
					? form.InputFields.find((c) => c.Id === this.SmartNav.RequiredInput) ?? null
					: null;
		}

		matchesQuery(query: string): boolean {
			return this.SearchText.includes(query.toLocaleLowerCase());
		}
	}

	class SearchResult {
		entry: SmartNavEntry;
		inputValue: string | null = null;
		url: string | null;
		orderIndex: number = 0;

		constructor(entry: SmartNavEntry, query: string | number | null) {
			this.entry = entry;
			this.inputValue = entry.RequiredInput != null ? query?.toString() ?? null : null;

			if (this.entry.RequiredInput != null) {
				this.url =
					query != null
						? `#/form/${entry.Metadata.Id}?${this.entry.RequiredInput.Id}=${query}`
						: null;

				// Forms that have a valid parameter should appear first
				// in the search results.
				this.orderIndex = query != null ? -100 : 0;
			} else {
				this.url = `#/form/${entry.Metadata.Id}`;
			}
		}
	}

	function getAll(): SmartNavEntry[] {
		if (forms.length === formMetadatas.length) {
			return forms;
		}

		forms = formMetadatas.map((t) => new SmartNavEntry(t));

		return forms;
	}

	function parseUserInput() {
		let formQuery: string;
		let paramValue: string | number | null;

		let parts = userInput
			.split(' ')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		// If there are multiple words then we assume that
		// one of them is a parameter value.
		if (parts.length > 1) {
			formQuery = parts[0];

			// Last word is always assumed to be the parameter value.
			paramValue = parts.slice(-1)[0];

			let paramValueAsInt = parseInt(paramValue ?? '');
			paramValue = isNaN(paramValueAsInt) ? paramValue?.trim() : paramValueAsInt;
		} else {
			formQuery = userInput;
			paramValue = null;
		}

		return {
			formQuery: formQuery.trim(),
			paramValue: paramValue
		};
	}

	const search = () => {
		if (searchResultsQuery === userInput) {
			// Don't perform the same search again.
			return searchResults;
		}

		activeSearchResultIndex = 0;
		searchResultsQuery = userInput;

		if (userInput.length === 0 || formMetadatas?.length === 0) {
			searchResults = [];
			return;
		}

		let parsedUserInput = parseUserInput();

		searchResults = getAll()
			.filter((t) => {
				return t.matchesQuery(parsedUserInput.formQuery);
			})
			.map((item) => {
				return new SearchResult(item, parsedUserInput.paramValue);
			})
			.sort((a, b) => {
				return a.orderIndex - b.orderIndex;
			})
			.slice(0, 5);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (!navigatorInFocus) {
			if (e.ctrlKey && e.key === 'k') {
				e.preventDefault();
				navigatorInputElement?.focus();
			}
		} else {
			switch (e.key) {
				case 'ArrowUp':
					e.preventDefault();
					navigateSearchResult(-1);
					break;
				case 'ArrowDown':
					e.preventDefault();
					navigateSearchResult(1);
					break;
				case 'Enter':
					e.preventDefault();
					submit(e);
					break;
				case 'Escape': {
					e.preventDefault();
					userInput = '';
					search();
					break;
				}
			}
		}
	};

	const onClick = (e: Event) => {
		if (navigatorInFocus) {
			navigatorInFocus = !(e.target instanceof Element && e.target.closest('.navigator') == null);
		}
	};

	const navigateSearchResult = (count: number) => {
		let sum = activeSearchResultIndex + count;
		if (sum >= searchResults.length) {
			sum = 0;
		} else if (sum < 0) {
			sum = searchResults.length - 1;
		}
		activeSearchResultIndex = sum;
	};

	const submit = (e: Event) => {
		e.preventDefault();

		let item = searchResults[activeSearchResultIndex];

		if (item.url != null) {
			userInput = (item.entry.EffectiveLabel + ' ' + (item.inputValue ?? '')).trim();
			window.location.href = item.url;
		}
	};
</script>

<svelte:window on:keydown={onKeyDown} on:click={onClick} />

<div class="navigator">
	<form
		on:submit={submit}
		on:focusin={() => {
			navigatorInFocus = true;
		}}
		on:focusout={(e) => {
			navigatorInFocus =
				e.relatedTarget instanceof Element && e.relatedTarget.closest('.navigator') != null;
		}}
	>
		<input
			placeholder="Search anything (CTRL+K)"
			autocomplete="off"
			bind:this={navigatorInputElement}
			bind:value={userInput}
			on:input={() => search()}
		/>
		<button type="submit"><i class="fas fa-search" /></button>
	</form>
	{#if navigatorInFocus && searchResults?.length > 0}
		<ul class="list-group">
			{#each searchResults as item, key}
				<li
					class="list-group-item list-group-item-action"
					class:active={activeSearchResultIndex == key}
				>
					{#if item.entry.RequiredInput != null}
						<a href={item.url}
							>{item.entry.EffectiveLabel}
							<span
								class="param-value"
								class:missing={item.inputValue == null}
								class:ok={item.inputValue != null}
							>
								{#if item.inputValue != null}
									{item.inputValue}
								{:else}
									{item.entry.RequiredInput.Label}
								{/if}
							</span>
						</a>
					{:else}
						<a href={item.url}>{item.entry.EffectiveLabel}</a>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.navigator {
		margin: 6px;
		padding: 0;
		width: 25vw;
		min-width: 200px;
		max-width: 400px;
		position: relative;

		& > form {
			width: 100%;
			display: flex;
			align-items: stretch;
			border: $input-border-width solid $input-border-color;
			border-radius: $input-border-radius;
			padding: 4px 8px;

			&:focus-within {
				box-shadow: $input-focus-box-shadow;
				border-color: $input-focus-border-color;
			}

			input {
				flex-grow: 1;
				height: auto;
				border: none;
				background: transparent;
				outline: none;
			}

			button {
				flex-grow: 0;
				border: none;
				background-color: transparent;
				cursor: pointer;
			}
		}
	}

	.list-group {
		margin-top: 2px;
		width: 100%;
		border: 1px solid $list-group-border-color;
		position: absolute;
		z-index: 1;

		& > .list-group-item {
			border: none;
			padding: 0;
			display: flex;
			align-items: stretch;
			$padding: 7px 11px;

			& > a {
				color: $list-group-color;
				flex-grow: 1;
				padding: $padding;

				& > .param-value {
					padding: 1px 3px;
					text-decoration: underline;

					&.missing {
						color: $danger;
						border-radius: 2px;
						background: $red-100;
						padding: 2px 14px;
						margin: 0px 10px;
					}
				}
			}

			&.active > a {
				color: $list-group-active-color;
			}
		}
	}
</style>
