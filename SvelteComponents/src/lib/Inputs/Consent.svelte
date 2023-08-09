<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export interface ConsentData {
		Consented: boolean;
	}

	export interface ConsentMetadata extends ComponentMetadata {
		Explanation: string;
	}

	export class Controller extends InputController<ConsentData> {
		declare metadata: ConsentMetadata;

		public getValue(): Promise<ConsentData | null> {
			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<ConsentData | null> {
			return Promise.resolve(value == null ? null : JSON.parse(value));
		}

		public serialize(value: ConsentData | null): string | null {
			if (value == null) {
				return null;
			}

			return JSON.stringify(value);
		}

		public open(): void {
			this.app.uibOpenModal({
				animation: true,
				templateUrl: this.metadata.Explanation,
				controller: [
					'$scope',
					'$uibModalInstance',
					function ($scope: any, $uibModalInstance: any) {
						$scope.close = function () {
							$uibModalInstance.dismiss('cancel');
						};
					}
				],
				size: 'lg'
			});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponentController } from '../Infrastructure/ComponentController';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export let controller: Controller;

	let component = new InputComponentController({
		init() {
			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<input
	class="consent-checkbox"
	on:change={() => controller.setValue({ Consented: !controller.value?.Consented })}
	required={controller.metadata.Required}
	type="checkbox"
/>

<span>{@html controller.metadata.Label}</span>

{#if controller.metadata.Explanation}
	<!-- svelte-ignore a11y-missing-attribute -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<a
		on:click={() => {
			controller.open();
		}}
	>
		<i class="fa fa-external-link" />
	</a>
{/if}
