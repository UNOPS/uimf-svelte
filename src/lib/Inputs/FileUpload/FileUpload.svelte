<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	interface Configuration {
		AcceptedFileTypes: string;
		NeedFileName: boolean;
		CssClass?: string;
	}

	export interface FileData {
		dataUrl: string | null;
		fileName: string | null;
		type: string | null;
	}

	export class Controller extends InputController<FileData, IInputFieldMetadata<Configuration>> {
		public getValue(): Promise<FileData | null> {
			if (this.value?.dataUrl == null || this.value.dataUrl.length === 0) {
				return Promise.resolve(null);
			}

			return Promise.resolve(this.value);
		}

		public deserialize(value: string | null): Promise<FileData | null> {
			if (value == null || value.length === 0) {
				return Promise.resolve(null);
			}

			return Promise.resolve(JSON.parse(value) as FileData);
		}

		public serialize(value: FileData | null): string | null {
			if (value?.dataUrl == null || value.dataUrl.length === 0) {
				return null;
			}

			return JSON.stringify(value);
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { IInputFieldMetadata } from '$lib/Infrastructure/Metadata';
	import { InputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';

	export let controller: Controller;

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;

			if (controller.value == null && fileInput != null) {
				fileInput.value = '';
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let fileInput: HTMLInputElement;

	function setFile(uploadedFile: File | null): Promise<void> {
		if (uploadedFile == null) {
			return controller.setValue(null);
		}

		return toBase64(uploadedFile).then((base64Url) => {
			return controller.setValue({
				...controller.value,
				fileName: uploadedFile.name,
				type: uploadedFile.type,
				dataUrl: base64Url as string
			} as FileData);
		});
	}

	function toBase64(file: File) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}
</script>

<div class:file-upload={true} class={controller.metadata.Component.Configuration.CssClass}>
	<input
		bind:this={fileInput}
		accept={controller.metadata.Component.Configuration.AcceptedFileTypes}
		class="form-control file-input"
		required={controller.metadata.Required && !controller.metadata.Hidden}
		form={controller.form?.getFormId()}
		type="file"
		on:change={async (e) => await setFile((e.currentTarget.files ?? [])[0])}
	/>

	{#await controller.getValue() then value}
		{#if value != null && value.dataUrl != null && value.type != null}
			<button
				type="button"
				use:tooltip={'Remove'}
				on:click={() => {
					fileInput.value = '';
					controller.setValue(null);
				}}><i class="fa fa-trash" /></button
			>
		{/if}
	{/await}
</div>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	.file-upload {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		border: 1px solid $border-color;

		& > input {
			flex-grow: 1;
			border: none;
			font-size: initial;
			line-height: initial;
			outline: none;
		}

		& > button {
			flex-grow: 0;
			border-color: $border-color;
			border-style: solid;
			border-width: 0 0 0 1px;
			background: transparent;
			padding: 0 15px;
			background-color: #f8f9fa;
		}
	}
</style>
