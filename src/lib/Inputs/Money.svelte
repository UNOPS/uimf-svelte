<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	interface IMoney {
		Amount: number;
		Currency: number;
	}

	interface IModel {
		Amount?: number | null;
		Currency?: number | null;
	}

	interface IMetadata extends IFieldMetadata<IConfiguration> {}

	export class Controller extends InputController<IMoney, IMetadata> {
		public model: IModel = {};

		public getValue(): Promise<IMoney | null> {
			var value = this.modelToValue(this.model);
			return Promise.resolve(value);
		}

		public deserialize(value: string | null): Promise<IMoney | null> {
			return Promise.resolve(value != null ? JSON.parse(value) : null);
		}

		public serialize(value: IMoney | null): string | null {
			return value != null ? JSON.stringify(value) : null;
		}

		protected setValueInternal(value: IMoney | null): Promise<void> {
			this.model = this.valueToModel(value);
			return Promise.resolve();
		}

		private valueToModel(value: IMoney | null): IModel {
			return {
				Amount: value?.Amount ?? null,
				Currency: value?.Currency ?? null
			};
		}

		private modelToValue(model: IModel): IMoney | null {
			if (model.Amount != null && model.Currency != null) {
				return {
					Amount: model.Amount,
					Currency: model.Currency
				};
			}

			return null;
		}
	}

	export interface IConfiguration {
		Max: number;
		Min: number;
		Precision: number;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';
	import { SessionStorageVariable } from '../Infrastructure/SessionStorageVariable';

	export let controller: Controller;

	let min: number;
	let max: number;
	let precision: number;
	let step: number;
	let currencies: any[] = [];

	let component = new InputComponent({
		async init() {
			controller.ready?.resolve();

			const cache = new SessionStorageVariable<[]>('uimf/inputs/money', async () => {
				var response: any = await controller.app.postForm(
					'currency-picker',
					{ GetAll: true },
					null
				);

				return response.Items;
			});

			currencies = (await cache.get()) ?? [];

			min = controller.metadata.Component.Configuration?.Min ?? Number.MIN_VALUE;
			max = controller.metadata.Component.Configuration?.Max ?? Number.MAX_VALUE;
			precision = controller.metadata.Component.Configuration?.Precision ?? 2;
			step = 1 / Math.pow(10, precision);
		},
		refresh() {
			controller.model = controller.model;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class="wrapper">
	<input
		class="form-control"
		bind:value={controller.model.Amount}
		required={controller.metadata.Required}
		{step}
		{min}
		{max}
		type="number"
	/>

	<select
		class="form-control"
		bind:value={controller.model.Currency}
		required={controller.metadata.Required}
	>
		<option value="" />
		{#each currencies as currency}
			<option value={currency.Value}>{currency.Label}</option>
		{/each}
	</select>
</div>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	input.form-control {
		min-height: $app-input-min-height;
	}

	.wrapper {
		display: flex;
		align-items: center;
		gap: 10px;

		& > * {
			align-content: stretch;
			flex-grow: 2;
		}

		& > input {
			flex-grow: 1;
			width: 100px;
		}
	}
</style>
