<script context="module" lang="ts">
	import type { OutputController } from '../../../Infrastructure/OutputController';
</script>

<script lang="ts">
	import type { PaginatedData } from '$lib/Outputs/PaginatedData.svelte';
	export let controller: OutputController<PaginatedData>;

	let paginator = controller.form!.inputs[controller.metadata.CustomProperties.Customizations.Paginator];
	let pageSizes = [10, 20, 50];
	let pageSize = paginator.value.PageSize ?? pageSizes[0];
	let pageCount = controller.value.TotalCount / pageSize + 1;
	let ActivePageIndex =  paginator.value.PageIndex ?? 1;
	let maxPage: number = Math.floor(controller.value.TotalCount / pageSize + 1);
	
	const getInputFieldValuesForPage = async (pageIndex: number) => {
		const inputValues = await controller.form?.getInputFieldValues();

		return {
			...inputValues,
			["Paginator"]: {
				PageIndex: pageIndex,
				PageSize: pageSize
			}
		};
	};

	const getUrl = async (pageIndex: number) => {
		let inputFieldValues;
		await getInputFieldValuesForPage(pageIndex).then((result) => {
			inputFieldValues = result;
		});

		return controller.app.makeUrl({
			Form: controller.form!.metadata.Id,
			InputFieldValues: inputFieldValues
		});
	};
</script>

{#if pageCount >= 1}
	<nav>
		<select
			class="form-select page-size"
			bind:value={pageSize}
			on:blur={() => {
				controller.form?.submit(true, {
					Paginator: {
						PageIndex: 1,
						PageSize: pageSize
					}
				});
			}}
		>
			{#each pageSizes as pageSize}
				<option value={pageSize}>{pageSize}</option>
			{/each}
		</select>
		<ul class="pagination">
			<!-- {#each pages as page} -->
			{#each Array(maxPage) as _, index (index + 1)}
				{#await getUrl(index + 1) then url}
					<li class="page-item" class:active={index + 1 == ActivePageIndex}>
						<a href={url} on:click={() => (ActivePageIndex = index + 1)}>{index + 1}</a>
					</li>
				{/await}
			{/each}
		</ul>
	</nav>
{/if}

<style lang="scss">
	.page-size {
		float: left;
		display: block;
		width: 80px;
		margin-right: 10px;
	}

	.page-link {
		min-width: 45px;
		text-align: center;
	}

	.page-item.active > .page-link {
		border-color: var(--app-border-color);
	}
</style>
