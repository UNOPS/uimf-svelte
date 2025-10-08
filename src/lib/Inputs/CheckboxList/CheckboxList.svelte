<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	interface Configuration {
		Options: string;
		OptionType: IComponent;
		DisabledItemMessage?: string;
		ShowDisabledReason?: boolean;
		CssClass?: string;
	}

	export interface CheckboxListOption {
		Value: any;
		IncompatibleWith?: any[];
		CssClass?: string;
		Label?: string;
	}

	export interface CheckboxListMetadata extends IInputFieldMetadata<Configuration> {}

	export class CheckboxListInput {
		SelectedItems!: any[];
	}

	export class Controller extends InputController<CheckboxListInput, CheckboxListMetadata> {
		public getValue(): Promise<CheckboxListInput | null> {
			return Promise.resolve(this.value);
		}

		protected setValueInternal(value: CheckboxListInput | null): Promise<void> {
			if (value == null || value.SelectedItems == null) {
				this.value = { SelectedItems: [] };
			}

			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<CheckboxListInput | null> {
			if (value == null || value == '') {
				return Promise.resolve({ SelectedItems: [] });
			}

			try {
				const parsed = JSON.parse(value);
				return Promise.resolve({
					SelectedItems: Array.isArray(parsed) ? parsed : []
				});
			} catch {
				return Promise.resolve({ SelectedItems: [] });
			}
		}

		public serialize(value: CheckboxListInput | null): string | null {
			if (value == null || value.SelectedItems == null || value.SelectedItems.length === 0) {
				return null;
			}

			return JSON.stringify(value.SelectedItems);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { IComponent, IInputFieldMetadata } from '../../Infrastructure/Metadata';
	import Output from '../../Output.svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';
	import { tooltip } from '../../Components/Tooltip.svelte';

	export let controller: Controller;

	let items: CheckboxListOption[] = [];
	let itemMetadata: any | null;

	let component = new InputComponent({
		init() {
			const optionsField = controller.metadata.Component.Configuration.Options;

			if (optionsField != null) {
				itemMetadata = OutputFieldMetadataFactory.fromComponent(
					controller.metadata.Component.Configuration.OptionType
				);
			}
		},
		async refresh() {
			items =
				controller.form?.response[controller.metadata.Component.Configuration.Options]?.value ?? [];

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function buildOutputController(value: any): OutputController<any> {
		return new OutputController({
			app: controller.app,
			data: value,
			form: controller.form,
			metadata: itemMetadata!,
			parent: controller
		});
	}

	function isSelected(option: CheckboxListOption, selectedItems: any[]): boolean {
		if (!selectedItems || selectedItems.length === 0) {
			return false;
		}

		const selectedSet = new Set(selectedItems.map((t) => t?.toString()));
		return selectedSet.has(option.Value?.toString());
	}

	function toggleSelection(option: CheckboxListOption, checked: boolean): void {
		const currentItems = controller.value?.SelectedItems ?? [];
		const currentSet = new Set(currentItems.map((t) => t?.toString()));
		const optionValueStr = option.Value?.toString();

		if (checked) {
			currentSet.add(optionValueStr);
		} else {
			currentSet.delete(optionValueStr);
		}

		controller.value = {
			SelectedItems: Array.from(currentSet).map((t) => {
				// Try to preserve original type (number vs string).
				const num = Number(t);
				return !isNaN(num) && num.toString() === t ? num : t;
			})
		};
	}

	function isDisabled(option: CheckboxListOption, selectedItems: any[]): boolean {
		if (!option.IncompatibleWith || option.IncompatibleWith.length === 0) {
			return false;
		}

		if (!selectedItems || selectedItems.length === 0) {
			return false;
		}

		const selectedSet = new Set(selectedItems.map((t) => t?.toString()));
		const incompatibleValues = option.IncompatibleWith.map((t) => t?.toString());

		// Check if any selected item conflicts with this option.
		for (const incompatibleValue of incompatibleValues) {
			if (selectedSet.has(incompatibleValue)) {
				return true;
			}
		}

		return false;
	}

	function getDisabledReason(option: CheckboxListOption, selectedItems: any[]): string | null {
		if (!isDisabled(option, selectedItems)) {
			return null;
		}

		const conflictingItems = items.filter(
			(t) =>
				isSelected(t, selectedItems) &&
				option.IncompatibleWith?.map((c) => c?.toString()).includes(t.Value?.toString())
		);

		if (conflictingItems.length === 0) {
			return null;
		}

		const template =
			controller.metadata.Component.Configuration.DisabledItemMessage ?? 'Cannot combine with {0}';

		const labels = conflictingItems
			.map((t) => {
				if (t.Label) {
					return t.Label;
				}
				const index = items.indexOf(t);
				return `Item #${index + 1}`;
			})
			.join(', ');

		return template.replace('{0}', labels);
	}
</script>

<div class:wrapper={true} class={controller.metadata.Component.Configuration.CssClass ?? ''}>
	{#each items as option}
		{@const selectedItems = controller.value?.SelectedItems ?? []}
		{@const selected = isSelected(option, selectedItems)}
		{@const disabled = isDisabled(option, selectedItems)}
		{@const reason = disabled ? getDisabledReason(option, selectedItems) : null}

		<div class={option.CssClass} class:selected class:disabled class:checkbox-item={true}>
			<div
				class="checkbox-container"
				role="button"
				tabindex={disabled ? -1 : 0}
				use:tooltip={disabled && reason ? reason : ''}
				on:click={() => !disabled && toggleSelection(option, !selected)}
				on:keydown={(e) => {
					if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
						toggleSelection(option, !selected);
						e.preventDefault();
					}
				}}
			>
				<input
					type="checkbox"
					checked={selected}
					{disabled}
					on:change={(e) => toggleSelection(option, e.currentTarget.checked)}
				/>
			</div>

			<div class="details">
				<Output controller={buildOutputController(option)} />
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.checkbox-item {
		--border: #d0d0d0;
		--bg: white;
		--border-width: 2px;

		&.selected {
			--border: var(--bs-primary);
			--bg: aliceblue;
		}

		&.disabled {
			--bg: #f5f5f5;
			opacity: 0.6;
		}

		border: var(--border-width) solid var(--border);
		border-radius: 2px;
		background-color: var(--bg);
		display: flex;
		flex-direction: row;

		&:last-child {
			margin-bottom: 0;
		}

		& > .checkbox-container {
			flex-basis: 60px;
			flex-grow: 0;
			flex-shrink: 0;
			border-right: var(--border-width) solid var(--border);
			cursor: pointer;

			display: flex;
			align-items: center;
			justify-content: center;

			& > input[type='checkbox'] {
				width: 20px;
				height: 20px;
				margin: 0;
				cursor: pointer;

				&:disabled {
					cursor: not-allowed;
				}
			}
		}

		&.disabled > .checkbox-container {
			cursor: not-allowed;
		}

		& > .details {
			flex-grow: 1;
			padding: 10px 15px;
		}
	}
</style>
