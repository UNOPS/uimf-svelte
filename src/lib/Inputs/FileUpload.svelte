<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export interface FileData {
		dataUrl: string | null;
		name: string | null;
		fileName: string | null;
		type: string | null;
	}

	interface FileUploadMetadata extends ComponentMetadata {
		CustomProperties: {
			AcceptedFileTypes: string;
			NeedFileName: boolean;
		};
	}

	export class Controller extends InputController<FileData, FileUploadMetadata> {
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

		public setFile(uploadedFile: File | null): Promise<void> {
			if (uploadedFile == null) {
				return Promise.resolve();
			}

			return this.toBase64(uploadedFile).then((base64Url) => {
				return this.setValue({
					...this.value,
					fileName: uploadedFile.name,
					type: uploadedFile.type,
					dataUrl: base64Url as string
				} as FileData);
			});
		}

		public setName(str: string): Promise<void> {
			return this.setValue({
				dataUrl: this.value?.dataUrl,
				fileName: this.value?.fileName,
				type: this.value?.type,
				name: str
			} as FileData);
		}

		toBase64(file: File) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = () => resolve(reader.result);
				reader.onerror = (error) => reject(error);
			});
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';
	import { InputComponent } from '../Infrastructure/Component';

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

	let fileInput: HTMLInputElement;
</script>

{#if controller.metadata.CustomProperties.NeedFileName}
	<label for="file-name">File name:</label>
	<input
		type="text"
		name="file-name"
		class="form-control file-name"
		on:change={async (e) => await controller.setName(e?.currentTarget?.value)}
		autocomplete="off"
		required={controller.metadata.Required}
	/>
{/if}

<input
	bind:this={fileInput}
	accept={controller.metadata.CustomProperties.AcceptedFileTypes}
	class="form-control file-input"
	required={controller.metadata.Required && !controller.metadata.Hidden}
	type="file"
	on:change={async (e) => await controller.setFile((e.currentTarget.files ?? [])[0])}
/>

{#await controller.getValue() then value}
	{#if value != null && value.dataUrl != null && value.type != null}
		{#if value.type.includes('image')}
			<img class="my-image" src={value.dataUrl} alt="" />
		{:else}
			<div class="card">
				<i class="file-icon fa fa-file fa-4x" />
				<div class="card-body">
					<p class="card-text">Type: {value.type.split('/')[1]}</p>
				</div>
			</div>
		{/if}
		<div class="buttons">
			<button
				type="button"
				class="btn btn-danger remove-button"
				on:click={() => {
					fileInput.value = '';
					controller.setValue(null);
				}}>Remove</button
			>
		</div>
	{/if}
{/await}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	.buttons {
		width: 100%;
	}

	.card {
		width: 10rem;
	}

	.my-image {
		padding-top: 1%;
		width: 30%;
		height: auto;
		max-width: 100%;
	}

	.file-name {
		width: 30%;
	}

	.file-input {
		margin-top: 10px;
	}

	.file-icon {
		text-align: center;
		padding: 5px;
	}

	.remove-button {
		margin-top: 5px;
	}
</style>
