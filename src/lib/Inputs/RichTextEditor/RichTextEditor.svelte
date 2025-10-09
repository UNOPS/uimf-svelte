<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';

	export class RichTextEditor {
		Value: any;
	}

	export class Controller extends InputController<RichTextEditor> {
		public getValue(): Promise<RichTextEditor | null> {
			return Promise.resolve(this.value);
		}

		protected setValueInternal(value: RichTextEditor | null): Promise<void> {
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
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import { richTextEditor } from './RichTextEditorAction';

	export let controller: Controller;

	let html: string = '';

	let component = new InputComponent({
		refresh() {
			controller.value = controller.value;
			html = controller.value?.Value ?? '';
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let invalid: boolean = false;

	function handleChange(newHtml: string) {
		html = newHtml;
		controller.setValue({ Value: html });

		// We want to indicate if the "required" validation is failing.
		// This isn't the most ideal UI (because it's different from the
		// other input types), but it's better than nothing.
		invalid = controller.metadata.Required && (html == null || html == '');
	}
</script>

<div class="wrapper" class:invalid>
	<div use:richTextEditor={{ html, onChange: handleChange }} />
</div>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

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
