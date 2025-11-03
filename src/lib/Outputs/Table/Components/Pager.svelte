<script context="module" lang="ts">
	import type { FormInstance } from '$lib/Infrastructure/FormInstance';
	import { OutputComponent } from '../../../Infrastructure/Component';
	import type { OutputController } from '../../../Infrastructure/OutputController';
	import type { UimfApp } from '../../../Infrastructure/App/UimfApp';
	import { PaginationParameters } from '../../../Inputs/Paginator/Paginator.svelte';
	import { beforeUpdate } from 'svelte';
	import type { TableMetadata } from './ResultsTable.svelte';

	export class Page {
		constructor(
			form: FormInstance,
			component: OutputComponent,
			inputFieldValues: any,
			index: number,
			label: string | null = null
		) {
			this.form = form;
			this.index = index;
			this.inputFieldValues = inputFieldValues;
			this.component = component;
			this.label = label ?? index.toString();
		}

		public index: number;
		public inputFieldValues: any;
		public label: string;
		private form: FormInstance;
		private component: OutputComponent;

		url(app: UimfApp): Promise<string> {
			return app.makeUrl({
				Form: this.form.metadata.Id,
				InputFieldValues: this.inputFieldValues
			});
		}

		async go() {
			await this.form.setInputFieldValues(this.inputFieldValues);
			await this.form.submit(true);
			await this.component.refresh();
		}
	}

	export class Pager {
		private range: number = 5;
		private paginatorId: string;
		private inputFieldValues: any = {};
		public pages: Page[] = [];
		public paginatorValue: PaginationParameters;
		public pageCount: number;
		public form: FormInstance;
		private component: OutputComponent;
		public fromRow: number;
		public toRow: number;

		constructor(
			controller: OutputController<any, TableMetadata>,
			inputFieldValues: any,
			component: OutputComponent
		) {
			this.form = controller.form!;
			this.inputFieldValues = inputFieldValues;
			this.component = component;

			// The basics.
			this.paginatorId = controller.metadata.Component.Configuration!.Paginator;
			this.paginatorValue = this.form.inputs[this.paginatorId].value || new PaginationParameters();
			this.pageCount = Math.ceil(controller.value.TotalCount / this.paginatorValue.PageSize);

			this.fromRow = this.paginatorValue.PageSize * (this.paginatorValue.PageIndex - 1) + 1;
			this.toRow = Math.min(
				this.paginatorValue.PageSize * this.paginatorValue.PageIndex,
				controller.value.TotalCount
			);

			this.initPages();
		}

		private addPage(i: number, label: string | null = null) {
			var formParams = this.getInputFieldValuesForPage(i);
			this.pages.push(new Page(this.form, this.component, formParams, i, label));
		}

		private initPages() {
			var minPage = Math.max(1, this.paginatorValue.PageIndex - this.range);
			var maxPage = Math.min(
				this.pageCount,
				Math.max(this.paginatorValue.PageIndex + this.range, this.range + 1)
			);

			if (this.paginatorValue.PageIndex - this.range > 1) {
				this.addPage(1, '1 ...');
			}

			for (let i = minPage; i <= maxPage; i++) {
				this.addPage(i);
			}

			if (this.paginatorValue.PageIndex + this.range < this.pageCount) {
				this.addPage(this.pageCount, `... ${this.pageCount}`);
			}
		}

		public getInputFieldValuesForPage(pageIndex: number, pageSize?: number) {
			var paginationParams = {
				...this.paginatorValue,
				PageIndex: pageIndex,
				PageSize: pageSize || this.paginatorValue.PageSize
			};

			return {
				...this.inputFieldValues,
				[this.paginatorId]: paginationParams
			};
		}
	}
</script>

<script lang="ts">
	export let controller: OutputController<any, TableMetadata>;

	let inputFieldValues: any = {};
	let pageSizes = [10, 20, 50, 100, 500];
	let pager: Pager;
	let useUrl: boolean = true;

	const component = new OutputComponent({
		async refresh() {
			const me: OutputComponent = this as OutputComponent;

			useUrl = controller.form?.parentForm != null && controller.form?.useUrl == true;

			inputFieldValues = await controller.form!.getInputFieldValues();
			pager = new Pager(controller, inputFieldValues, me);

			// Make sure that the current page size is in the list of available page sizes.
			pageSizes = [...new Set([10, 20, 50, 100, 500, pager.paginatorValue.PageSize])].sort(
				(a, b) => a - b
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		if (
			controller?.metadata?.Component.Type == 'paginated-table' ||
			controller?.metadata?.Component.Type == 'paginated-object-list'
		) {
			await component.setup(controller);
		}
	});
</script>

{#if pager?.pageCount > 1 || pager?.paginatorValue?.PageSize > 10}
	<nav>
		<div>
			<span>
				Items {pager.fromRow}-{pager.toRow} of {controller.value.TotalCount} |
			</span>
			<select
				class="form-select page-size"
				bind:value={pager.paginatorValue.PageSize}
				on:change={async () => {
					var values = pager.getInputFieldValuesForPage(1);

					if (controller.form == null) {
						throw new Error('Form is not set.');
					}

					if (useUrl) {
						await controller.app.goto({
							Form: controller.form.metadata.Id,
							InputFieldValues: values
						});
					} else {
						new Page(controller.form, component, values, 1).go();
					}
				}}
			>
				{#each pageSizes as pageSize}
					<option value={pageSize}>{pageSize}</option>
				{/each}
			</select>
			<span>per page</span>
		</div>
		<ul class="pagination">
			{#each pager.pages as page}
				<li class="page-item" class:active={page.index == pager.paginatorValue.PageIndex}>
					{#if useUrl}
						{#await page.url(controller.app) then url}
							<a class="page-link" href={url} data-sveltekit-noscroll>{@html page.label}</a>
						{/await}
					{:else}
						<button class="page-link" on:click={() => page.go()}>{@html page.label}</button>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style lang="scss">
	@import '../../../scss/styles.variables.scss';

	nav {
		--height: 32px;
		--outer-border-color: #ebebeb;

		display: flex;
		gap: 10px;
		margin: 1px 0 0;
		justify-content: space-between;
		align-items: center;

		& > div {
			display: flex;
			align-items: center;
			opacity: 0.6;
			width: 380px;
			margin-left: 10px;

			& > .page-size {
				width: auto;
				min-width: 38px;
				border: none;
				outline: none;
				font-size: 1.2rem;
				margin: 0 5px;
				padding: 0 5px;
				border-bottom: 1px solid var(--bs-body-color);
				position: relative;
				top: 1px;
				background-position: right 0px center;

				& > option {
					padding: 3px 5px;
				}
			}
		}

		& > ul.pagination {
			margin: 0;
			background: $gray-100;
			border-radius: 0 0px 4px 4px;
			border: 1px solid var(--outer-border-color);
			border-top: none;

			& > li > .page-link {
				min-width: 35px;
				text-align: center;
				line-height: calc(var(--height) - 2px);
				padding: 0 5px;
				margin: 0;
				border: none;
				text-decoration: underline;

				&:hover {
					box-shadow: none;
				}

				& > :global(i) {
					opacity: 0.5;
					padding: 0 8px 0 10px;
				}
			}

			& > li.active > .page-link {
				border-color: var(--app-border-color);
				background: #54abd9;
				color: white;
			}
		}
	}
</style>
