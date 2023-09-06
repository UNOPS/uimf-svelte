<script lang="ts" context="module">
	interface PaginatedObjectList {
		Results: any[];
		TotalCount: number;
	}
</script>

<script lang="ts">
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { beforeUpdate } from 'svelte';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';

	export let controller: OutputController<PaginatedObjectList>;

	const resultPerPageOpt1 = 6;
	const resultPerPageOpt2 = 12;
	const resultPerPageOpt3 = 24;

	let currentPaginator = controller.form!.inputs[controller.metadata.CustomProperties.Customizations.Paginator];
	let currentPage = currentPaginator.value.PageIndex;
	let resultPerPage = currentPaginator.value.PageSize;

	let nestedComponentType = controller.metadata.CustomProperties.ItemTypes.Type;
	let nestedComponent = controlRegister.outputs[nestedComponentType].component;

	let nestedControllers: OutputController<any>[];
	let paginatedUrls: any[];
	let perPageUrls: any[];

	// values of inputs, except paginator
	let inputValues: any;

	let component = new OutputComponentController({
		async refresh() {
			await GetInputValues().then((results) => {
				if (inputValues != undefined && !areEqual(inputValues, results)) {
					currentPage = 1;
				}

				inputValues = results;
				paginatedUrls = createPaginatedUrls(inputValues);
				perPageUrls = createPerPageUrls(inputValues);
				nestedControllers = createNestedControllers(controller.value.Results);
				controller.value = controller.value;
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));

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

	function createPaginatedUrls(inputValues: any) {
		let urls: any = [];

		let lastPage = Math.ceil(controller.value.TotalCount / resultPerPage);

		for (let i = 0; i < lastPage; i++) {
			// Page 1 is at position 0, etc.
			urls[i] = createPaginatedUrl(i + 1, inputValues);
		}

		return urls;
	}

	function createPerPageUrls(inputValues: any) {
		let urls: any = [];

		urls[resultPerPageOpt1] = createPaginatedUrl(currentPage, inputValues);
		urls[resultPerPageOpt2] = createPaginatedUrl(currentPage, inputValues);
		urls[resultPerPageOpt3] = createPaginatedUrl(currentPage, inputValues);

		return urls;
	}

	function createPaginatedUrl(pageIndex: number, inputValues: any) {
		let currentInputValues = JSON.parse(JSON.stringify(inputValues));

		// add serialized paginator as an input before building the URL
		currentInputValues['Paginator'] = currentPaginator.serialize({
			PageIndex: pageIndex,
			PageSize: resultPerPage
		});

		return controller.form?.app.makeUrl({
			Form: controller.form.metadata.Id,
			InputFieldValues: currentInputValues
		});
	}

	function createNestedControllers(results: any[]) {
		let controllerArray: OutputController<any>[] = [];

		results.forEach((result) => {
			let childController = new OutputController<any>(
				controller.metadata,
				null,
				controller.form,
				controller.app
			);

			childController.setValue(result);

			controllerArray.push(childController);
		});

		return controllerArray;
	}

	async function GetInputValues() {
		//convert inputs in an array on which we can loop
		let inputsArray = Object.keys(controller.form!.inputs).map((key) => ({
			Type: key,
			Input: controller.form!.inputs[key]
		}));

		let serializedValues: any = [];

		for (let i = 0; i < inputsArray.length; i++) {
			const inputType = inputsArray[i].Type;
			const input = inputsArray[i].Input;

			const value = await input.getValue();

			// paginator will be determinated when building urls
			if (inputType === 'Paginator') continue;

			serializedValues[inputType] = input.serialize(value);
		}

		return Promise.resolve(serializedValues);
	}
</script>

<div class="list-container">
	{#if nestedControllers != null}
		{#each nestedControllers as controller}
			{#if controller.value}
				<svelte:component this={nestedComponent} {controller} />
			{/if}
		{/each}
	{/if}
</div>
{#if paginatedUrls != null}
	<nav class="pagination">
		<div class="per-page-selector">
			<a href={perPageUrls[resultPerPageOpt1]}>{resultPerPageOpt1}</a> |
			<a href={perPageUrls[resultPerPageOpt2]}>{resultPerPageOpt2}</a> |
			<a href={perPageUrls[resultPerPageOpt3]}>{resultPerPageOpt3}</a>
		</div>

		<div class="page-selector">
			<ul>
				{#each paginatedUrls as url, index}
					{#if index + 1 == 1 || // first page
					index + 1 == Math.ceil(controller.value.TotalCount / resultPerPage) || // last page
					index + 1 == currentPage || // current page
					index + 1 == currentPage - 1 || 
					index + 1 == currentPage + 1}
						<li class={currentPage === index + 1 ? 'active' : ''}>
							<a href={url} on:click={() => currentPage = index + 1}>{index + 1}</a>
						</li>
					{:else if index + 1 == 2 || // second page
					index + 1 == Math.ceil(controller.value.TotalCount / resultPerPage) - 1}
						<span class=""> . . . </span>
					{/if}
				{/each}
			</ul>
		</div>
	</nav>
{/if}

<style>
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
