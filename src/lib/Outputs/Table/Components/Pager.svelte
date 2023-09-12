<script context="module" lang="ts">
	import type { OutputController } from '../../../Infrastructure/OutputController';
</script>

<script lang="ts">
	import { OutputComponentController } from '../../../Infrastructure/ComponentController';
	import type { PaginatedData } from '$lib/Outputs/PaginatedData.svelte';
	import { beforeUpdate } from 'svelte';
	export let controller: OutputController<PaginatedData>;

	let paginator =
		controller.form!.inputs[controller.metadata.CustomProperties.Customizations.Paginator];
	let pageSizes = [10, 20, 50];

	let pageSize = paginator.value.PageSize ?? pageSizes[0];
	let pageCount = controller.value.TotalCount / pageSize + 1;
	let activePageIndex = paginator.value.PageIndex ?? 1;
	let maxPage: number = Math.floor(controller.value.TotalCount / pageSize + 1);

	let inputValues: any;

	// array of urls
	let pageUrls: string[] = new Array(maxPage);
	let selectorUrls: string[] = new Array(pageSizes.length);

	let component = new OutputComponentController({
		async init() {
			inputValues = await controller.form?.getInputFieldValues();
			setCountPage();
			LoadPageUrls();
			LoadSelectorUrls();
		},

		async refresh() {
			await controller.form?.getInputFieldValues().then(async (results) => {
				if (inputValues != undefined && !areEqual(inputValues, results)) {
					activePageIndex = 1;
				}

				controller.value = controller.value;
				inputValues = results;

				pageUrls.splice(0, pageUrls.length);
				selectorUrls.splice(0, selectorUrls.length);

				setCountPage();
				LoadSelectorUrls();
				LoadPageUrls();
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let LoadSelectorUrls = async () => {
		pageSizes.forEach(async (element, i) => {
			selectorUrls[i] = await getUrl(activePageIndex, element);
		});
	};

	let LoadPageUrls = async () => {
		for (let i = 0; i < maxPage; i++) {
			pageUrls[i] = await getUrl(i + 1, pageSize);
		}
	};

	function areEqual(obj1: any, obj2: any): boolean {
		for (let key in obj1) {
			if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
				if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
					if (!areEqual(obj1[key], obj2[key])) {
						return false;
					}
				} else if (obj1[key] !== obj2[key]) {
					return false;
				}
			} else {
				return false;
			}
		}
		return true;
	}

	const getInputFieldValuesForPage = async (index: number, size: number) => {
		return {
			...inputValues,
			['Paginator']: {
				PageIndex: index,
				PageSize: size
			}
		};
	};

	const getUrl = async (index: number, size: number) => {
		const inputFieldValues = await getInputFieldValuesForPage(index, size);

		return controller.app.makeUrl({
			Form: controller.form!.metadata.Id,
			InputFieldValues: inputFieldValues
		});
	};

	function setCountPage() {
		maxPage = Math.floor(controller.value.TotalCount / pageSize + 1);
	}
</script>

{#if pageCount >= 1}
	<nav class="pagination">
		<div class="per-page-selector">
			{#each selectorUrls as url, index}
				<a href={url}>{pageSizes[index]}</a>

				<!-- no space after last page -->
				{#if index != pageSizes.length - 1}
					<span> - </span>
				{/if}
			{/each}
		</div>
		<div class="page-selector">
			<ul>
				{#if activePageIndex > 1}
					{#await getUrl(activePageIndex - 1, pageSize) then url}
						<li>
							<a href={url} on:click={() => activePageIndex--}><i class="fas fa-step-backward" /></a
							>
						</li>
					{/await}
				{/if}
				{#each pageUrls as url, index (index + 1)}
					<li class={activePageIndex === index + 1 ? 'active' : ''}>
						<a href={url} on:click={() => (activePageIndex = index + 1)}>{index + 1}</a>
					</li>
				{/each}
				{#if activePageIndex < maxPage - 2}
					{#await getUrl(activePageIndex + 1, pageSize) then url}
						<li>
							<a href={url} on:click={() => activePageIndex++}><i class="fas fa-step-forward" /></a>
						</li>
					{/await}
				{/if}
			</ul>
		</div>
	</nav>
{/if}

<style lang="scss">
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		height: 100px;
	}

	.per-page-selector {
		font-size: 16px;
		margin-bottom: 10px;
	}

	.per-page-selector a {
		color: #007bff;
		margin: 0 5px;
		text-decoration: none;
	}

	.per-page-selector a:hover {
		text-decoration: underline;
	}

	.list-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
	}

	.page-selector {
		margin-top: 10px;
		text-align: center;
	}

	.page-selector ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.page-selector li {
		display: inline-block;
		margin-right: 5px;
	}

	.page-selector li a {
		display: inline-block;
		padding: 5px 10px;
		background-color: #dddddd;
		color: #3d3d3d;
		text-decoration: none;
	}

	.page-selector li.active a {
		background-color: #007bff;
		color: #ffffff;
	}

	.page-selector li a:hover {
		background-color: #007bff;
		color: #ffffff;
	}
</style>
