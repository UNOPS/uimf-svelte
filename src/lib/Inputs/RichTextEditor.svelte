<script lang="ts" context="module">
	import { InputController } from '../Infrastructure/InputController';

	export class RichTextEditor {
		Value: any;
	}

	export class Controller extends InputController<RichTextEditor> {
		public html: string | null = null;
		protected callback?: (html: string | null) => void;

		public getValue(): Promise<RichTextEditor | null> {
			return Promise.resolve(this.value);
		}

		protected setValueInternal(value: RichTextEditor | null): Promise<void> {
			this.html = this.serialize(value);
			this.callback?.(this.html);

			return Promise.resolve();
		}

		public deserialize(value: string | null): Promise<RichTextEditor | null> {
			if (value == null || value == '') {
				return Promise.resolve(null);
			}

			return Promise.resolve({ Value: value });
		}

		public serialize(editor: RichTextEditor | null): string | null {
			return editor?.Value;
		}

		public setCallback(callback: (html: string | null) => void) {
			this.callback = callback;
		}
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../Infrastructure/Component';
	import Editor from 'cl-editor/src/Editor.svelte';

	export let controller: Controller;
	export let html: string | null;

	export const getHtml = () => html;

	let editor: Editor;
	let isInitiated: boolean;

	let component = new InputComponent({
		init() {
			controller.ready?.resolve();
			controller.setCallback((content: string | null) => {
				if (content) {
					html = content;
					if (!isInitiated) {
						editor.setHtml(html!, true);
						isInitiated = true;
					}
				}
			});
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let invalid: boolean = false;
	let onChange = (e: any) => {
		let safeHtml = editor.getHtml(true);

		html = safeHtml;
		isInitiated = true;
		controller.setValue({ Value: safeHtml });

		// We want to indicate if the "required" validation is failing.
		// This isn't the most ideal UI (because it's different from the
		// other input types), but it's better than nothing.
		invalid = controller.metadata.Required && (safeHtml == null || safeHtml == '');
	};
</script>

<div class="wrapper" class:invalid>
	<Editor bind:this={editor} {html} on:change={onChange} />
</div>

<style lang="scss">
	@import '../../lib/scss/styles.variables.scss';

	.wrapper {
		border: $input-border-width solid $input-border-color;
	}

	.invalid {
		border-color: $danger;
	}

	.wrapper > div {
		box-shadow: none;
	}
</style>
