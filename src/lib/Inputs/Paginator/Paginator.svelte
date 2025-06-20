<script context="module" lang="ts">
	import { InputController } from '../../Infrastructure/InputController';

	export class Controller extends InputController<PaginationParameters> {
		public deserialize(value: string): Promise<PaginationParameters | null> {
			// 1-10-firstname-asc
			// 1-10

			if (value == null || value.length === 0) {
				return Promise.resolve(new PaginationParameters());
			}

			const components = value.split('-');
			var result = new PaginationParameters(
				components[0],
				components[1],
				components[2],
				components[3]
			);

			return Promise.resolve(result);
		}

		public serialize(value: PaginationParameters): string | null {
			if (value == null) {
				return null;
			}

			if (
				value.PageIndex === 1 &&
				value.PageSize === 10 &&
				value.Ascending == null &&
				value.OrderBy == null
			) {
				return null;
			}

			let result = `${value.PageIndex}-${value.PageSize}`;

			if (value.OrderBy != null) {
				result += `-${value.OrderBy}-${value.Ascending}`;
			}

			return result;
		}

		public getValue(): Promise<PaginationParameters | null> {
			return Promise.resolve(this.value);
		}

		protected setValueInternal(value: PaginationParameters): Promise<void> {
			if (value == null) {
				this.value = new PaginationParameters();
			}

			return Promise.resolve();
		}
	}

	export class PaginationParameters {
		constructor(
			pageIndex?: number | string,
			pageSize?: number | string,
			orderBy?: string,
			ascending?: boolean | string
		) {
			this.PageIndex = PaginationParameters.asInt(pageIndex, 1);
			this.PageSize = PaginationParameters.asInt(pageSize, 10);
			this.OrderBy = orderBy || null;
			this.Ascending = PaginationParameters.asBool(ascending, null);
		}

		public PageSize: number;
		public PageIndex: number;
		public Ascending: boolean | null;
		public OrderBy: string | null;

		private static asInt(value: number | string | undefined, defaultValue: number): number {
			if (typeof value === 'string') {
				const result = parseInt(value, 10);
				return isNaN(result) ? defaultValue : result;
			}

			if (value == null) {
				return defaultValue;
			}

			return value;
		}

		private static asBool(
			value: boolean | string | undefined,
			defaultValue: boolean | null
		): boolean | null {
			if (typeof value === 'string' || value == null) {
				return value != null ? value.toString() === 'true' : defaultValue;
			}

			return value;
		}
	}
</script>
