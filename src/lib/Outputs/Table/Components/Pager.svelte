<script context="module" lang="ts">
	import type { OutputController } from '../../../Infrastructure/OutputController';
</script>

<script lang="ts">
	import type { PaginatedData } from '$lib/Outputs/PaginatedData.svelte';
	export let controller: OutputController<PaginatedData>;

	let paginator =
		controller.form!.inputs[controller.metadata.CustomProperties.Customizations.Paginator];
	let pageSizes = [10, 20, 50];

	console.log('paginator pageSize', paginator.value.PageSize);
	console.log('paginator', paginator);
	let pageSize = paginator.value.PageSize ?? pageSizes[0];
	let pageCount = controller.value.TotalCount / pageSize + 1;
	let ActivePageIndex = paginator.value.PageIndex ?? 1;
	let maxPage: number = Math.floor(controller.value.TotalCount / pageSize + 1);

	const getInputFieldValuesForPage = async (index: number, size: number) => {
		const inputValues = await controller.form?.getInputFieldValues();

		return {
			...inputValues,
			['Paginator']: {
				PageIndex: index,
				PageSize: size
			}
		};
	};

	const getUrl = async (index: number, size: number) => {
		let inputFieldValues;
		await getInputFieldValuesForPage(index, size).then((result) => {
			inputFieldValues = result;
		});

		return controller.app.makeUrl({
			Form: controller.form!.metadata.Id,
			InputFieldValues: inputFieldValues
		});
	};
</script>

{#if pageCount >= 1}
	<nav class="pagination">
		<div class="per-page-selector">
			{#each pageSizes as size, index}
				{#await getUrl(ActivePageIndex, size) then url}
					<a href={url}> {size} </a>
					{#if index + 1 != pageSizes.length}
						<span> - </span>
					{/if}
				{/await}
			{/each}
		</div>
		<div class="page-selector">
			<ul>
				{#each Array(maxPage) as _, index (index + 1)}
					{#await getUrl(index + 1, pageSize) then url}
						<li class={ActivePageIndex === index + 1 ? 'active' : ''}>
							<a href={url} on:click={() => (ActivePageIndex = index + 1)}>{index + 1}</a>
						</li>
					{/await}
				{/each}
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
