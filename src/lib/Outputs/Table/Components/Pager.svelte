<script context="module" lang="ts">
	import type { FormInstance } from '../../../Infrastructure/FormController';
	import { OutputComponent } from '../../../Infrastructure/Component';
	import type { OutputController } from '../../../Infrastructure/OutputController';
	import type UimfApp from '../../../Infrastructure/UimfApp';
	import { PaginationParameters } from '../../../Inputs/Paginator.svelte';
	import { beforeUpdate } from 'svelte';

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
			controller: OutputController<any>,
			inputFieldValues: any,
			component: OutputComponent
		) {
			this.form = controller.form!;
			this.inputFieldValues = inputFieldValues;
			this.component = component;

			// The basics.
			this.paginatorId = controller.metadata.CustomProperties.Customizations.Paginator;
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
	export let controller: OutputController<any>;

	let inputFieldValues: any = {};
	let pageSizes = [10, 20, 50, 100];
	let pager: Pager;

	const component = new OutputComponent({
		async refresh() {
			const me: OutputComponent = this as OutputComponent;

			inputFieldValues = await controller.form!.getInputFieldValues();
			pager = new Pager(controller, inputFieldValues, me);

			// Make sure that the current page size is in the list of available page sizes.
			pageSizes = [...new Set([10, 20, 50, 100, pager.paginatorValue.PageSize])].sort(
				(a, b) => a - b
			);
		}
	});

	beforeUpdate(async () => {
		if (controller?.metadata?.Type == 'paginated-data') {
			await component.setup(controller);
		}
	});
</script>

{#if pager?.pageCount > 1 || pager?.paginatorValue?.PageSize > 10}
	<nav>
		<div>
			<span>
				Showing rows {pager.fromRow}-{pager.toRow} of {controller.value.TotalCount}, with
			</span>
			<select
				class="form-select page-size"
				bind:value={pager.paginatorValue.PageSize}
				on:change={async () => {
					var values = pager.getInputFieldValuesForPage(1);

					if (controller.form == null) {
						throw new Error('Form is not set.');
					}

					if (controller.form.parentForm != null) {
						new Page(controller.form, component, values, 1).go();
					} else {
						await controller.app.goto({
							Form: controller.form.metadata.Id,
							InputFieldValues: values
						});
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
					{#if controller.form?.parentForm != null}
						<button class="page-link" on:click={() => page.go()}>{@html page.label}</button>
					{:else}
						{#await page.url(controller.app) then url}
							<a class="page-link" href={url} data-sveltekit-noscroll>{@html page.label}</a>
						{/await}
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

			& > .page-size {
				width: auto;
				min-width: 38px;
				height: 18px;
				border: none;
				outline: none;
				font-size: 1.2rem;
				margin: 0 5px;
				padding: 0;
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
			}
		}
	}
</style>
