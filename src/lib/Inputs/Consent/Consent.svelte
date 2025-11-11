<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	export interface ConsentData {
		Consented: boolean;
	}

	export interface ConsentConfiguration {
		Explanation: string | null;
		Label: string | null;
	}

	export class Controller extends InputController<
		ConsentData,
		IInputFieldMetadata<ConsentConfiguration>
	> {
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
			if (this.metadata.Component.Configuration.Explanation) {
				this.app.openHtmlModal({
					templateUrl: this.metadata.Component.Configuration.Explanation,
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
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IFieldMetadata, IInputFieldMetadata } from '$lib/Infrastructure/Metadata';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div>
	<label>
		<input
			on:change={() => controller.setValue({ Consented: !controller.value?.Consented })}
			required={controller.metadata.Required}
			type="checkbox"
			form={controller.form?.getFormId()}
		/>
		{#if controller.metadata.Component?.Configuration?.Label != null}
			{@html controller.metadata.Component.Configuration.Label}
		{/if}
	</label>

	{#if controller.metadata.Component?.Configuration?.Explanation != null}
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
</div>

<style lang="scss">
	label {
		display: inline;
	}

	button {
		display: inline;
	}

	input {
		margin-right: 5px;
		position: relative;
		top: 2px;
	}
</style>
