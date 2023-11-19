<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export interface ConsentData {
		Consented: boolean;
	}

	export interface ConsentMetadata extends ComponentMetadata {
		Explanation: string;
	}

	export class Controller extends InputController<ConsentData, ConsentMetadata> {
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
			this.app.openHtmlModal({
				templateUrl: this.metadata.Explanation,
				controller: [
					'$scope',
					'$uibModalInstance',
					function ($scope: any, $uibModalInstance: any) {
						$scope.close = function () {
							$uibModalInstance.dismiss('cancel');
						};
					}
				]
			});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export let controller: Controller;

	let component = new InputComponent({
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
	<button
		type="button"
		on:click={() => {
			controller.open();
		}}
		aria-label="Open Explanation"
	>
		<i class="fa fa-external-link" />
	</button>
{/if}
