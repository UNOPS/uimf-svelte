<script context="module" lang="ts">
	import { OutputController } from '../../../Infrastructure/OutputController';
</script>

<script lang="ts">
	import { OutputComponentController } from '../../../Infrastructure/ComponentController';
	import type { PaginatedData } from '$lib/Outputs/PaginatedData.svelte';
	import { beforeUpdate } from 'svelte';
	import FormLink from '../../../Outputs/FormLink.svelte';
	import type {
		Controller as FormLinkController,
		FormLinkData,
		FormLinkMetadata
	} from '../../../Outputs/FormLink.svelte';
	export let controller: OutputController<PaginatedData>;

	interface PageData {
		label: string;
		index: number
	}

	let pages: PageData[] = [];
	let paginator = controller.metadata.CustomProperties?.Customizations?.Paginator;
	let pageSizes = [10, 20, 50];
	let pageSize = pageSizes[0];
	let range = pageSize;
	let pageCount = (controller.metadata.CustomProperties?.Columns.length - 1) / pageSize;
	pageCount = pageCount < 1 ? 1 : pageCount;
	let ActivePageIndex = 1;

	const component = new OutputComponentController({
		async init() {
			await initPages();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	const addPage = async (i: number, label: string = '') => {
		let formParams = await getInputFieldValuesForPage(i);
		let url = controller.app.makeUrl({
			InputFieldValues: formParams,
			Form: controller.form?.metadata.Id
		} as FormLinkData);

		url += Object.keys(formParams).length === 0 ? '?' : '&';
		url += `Paginator=${i}-${pageSize}`;

		pages.push({ label: label.length == 0 ? i : label, index: i } as PageData);
		pages = pages;
	};

	const initPages = async () => {
		let pageIndex = paginator.PageIndex ?? 1;
		let minPage = Math.max(1, pageIndex ?? 1 - range);
		let maxPage = Math.min(pageCount, Math.max(pageIndex + range, range + 1));

		console.log(pageIndex, minPage, maxPage);

		if (pageIndex - range > 1) {
			await addPage(1, '1 <i class="fas fa-step-backward"></i>');
		}

		for (let i = minPage; i <= maxPage; i++) {
			await addPage(i);
		}

		if (pageIndex + range < pageCount) {
			await addPage(pageCount, `<i class="fas fa-step-forward"></i> ${pageCount}`);
		}
	};

	const getInputFieldValuesForPage = async (pageIndex: number) => {
		let inputValues = await controller.form?.getInputControllers().map(async (item) => {
			let value = await item.getValue();
			return { [item.metadata.Id]: value };
		});

		return {
			...inputValues,
			[paginator]: {
				PageIndex: pageIndex,
				PageSize: pageSize
			}
		};
	};

	const makeFormLinkController = async (pageIndex: number) => {
		let formLinkData = {
			Form: controller.form!.metadata.Id,
			InputFieldValues: await getInputFieldValuesForPage(pageIndex),
			Action: 'run',
			Label: pageIndex.toString(),
			PostWithInputFieldValues: true
		} as FormLinkData;

		return new OutputController<FormLinkData>(
			{ disabled: false } as FormLinkMetadata,
			formLinkData,
			controller.form,
			controller.app
		) as FormLinkController;
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
				})
			}}
		>
			{#each pageSizes as pageSize}
				<option value={pageSize}>{pageSize}</option>
			{/each}
		</select>
		<ul class="pagination">
			{#each pages as page}
				{#await makeFormLinkController(page.index) then controller}
					<li class="page-item" class:active={page.index == ActivePageIndex}>
						<FormLink {controller} />
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
