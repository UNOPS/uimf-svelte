import Editor from 'cl-editor/src/Editor.svelte';

export interface RichTextEditorOptions {
	html?: string;
	onChange?: (html: string) => void;
	onBlur?: () => void;
	height?: string;
}

interface EditorState {
	instance: Editor;
	lastHtml: string;
	isInternalUpdate: boolean; // Track if update is from this file itself
	changeUnsubscribe?: () => void; // Cleanup function for onChange listener
	blurUnsubscribe?: () => void; // Cleanup function for onBlur listener
}

let editors = new Map<HTMLElement, EditorState>();

function updateEventListeners(state: EditorState, options: RichTextEditorOptions): void {
	// Unsubscribe from old event listeners
	state.changeUnsubscribe?.();
	state.blurUnsubscribe?.();

	// Subscribe to new event listeners with current callbacks
	if (options.onChange) {
		state.changeUnsubscribe = state.instance.$on('change', (evt: CustomEvent) => {
			// Mark this as an internal update so we don't call setHtml on the next update
			state.isInternalUpdate = true;
			state.lastHtml = evt.detail;
			options.onChange!(evt.detail);
		});
	} else {
		state.changeUnsubscribe = undefined;
	}

	if (options.onBlur) {
		state.blurUnsubscribe = state.instance.$on('blur', () => {
			options.onBlur!();
		});
	} else {
		state.blurUnsubscribe = undefined;
	}
}

function process(node: HTMLElement, options: RichTextEditorOptions) {
	let state = editors.get(node);

	if (state != null) {
		const newHtml = options.html ?? '';

		// Only call setHtml if this is an external update (not from the editor's own onChange)
		if (state.lastHtml !== newHtml && !state.isInternalUpdate) {
			state.instance.setHtml(newHtml, true);
			state.lastHtml = newHtml;
		}

		// Reset the flag after processing
		state.isInternalUpdate = false;
	} else {
		const instance = new Editor({
			target: node,
			props: {
				html: options.html ?? '',
				height: options.height ?? '300px'
			}
		});

		state = {
			instance,
			lastHtml: options.html ?? '',
			isInternalUpdate: false
		};

		editors.set(node, state);

		updateEventListeners(state, options);
	}
}

export function richTextEditor(node: HTMLElement, options: RichTextEditorOptions) {
	process(node, options);

	return {
		destroy() {
			const state = editors.get(node);

			if (state != null) {
				state.changeUnsubscribe?.();
				state.blurUnsubscribe?.();

				state.instance.$destroy();
				editors.delete(node);
			}
		},
		update(newOptions: RichTextEditorOptions) {
			process(node, newOptions);
		}
	};
}
