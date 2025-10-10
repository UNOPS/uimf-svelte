<script context="module" lang="ts">
	import tippy, { roundArrow } from 'tippy.js';
	import type { Instance as TippyInstance, Placement } from 'tippy.js';
	import 'tippy.js/dist/svg-arrow.css';

	export interface PopoverOptions {
		/**
		 * The content to display in the popover.
		 * Can be a string (HTML), an HTMLElement, or a function that returns content.
		 */
		content: string | HTMLElement | (() => string | HTMLElement);

		/**
		 * The placement of the popover relative to the trigger element.
		 * Default: 'top'
		 */
		placement?: Placement;

		/**
		 * The event that triggers the popover.
		 * Default: 'click'
		 */
		trigger?: 'click' | 'mouseenter' | 'focus' | 'manual' | string;

		/**
		 * Determines if the popover has interactive content.
		 * When true, the popover remains visible when hovering over it.
		 * Default: true
		 */
		interactive?: boolean;

		/**
		 * Maximum width of the popover.
		 * Can be a number (pixels) or string (CSS value).
		 */
		maxWidth?: number | string | null;

		/**
		 * Additional CSS class to apply to the popover content.
		 */
		className?: string;
	}

	let popovers = new Map<HTMLElement, TippyInstance>();

	function process(node: HTMLElement, options: PopoverOptions) {
		let instance = popovers.get(node);

		const tippyContent =
			typeof options.content === 'function'
				? (reference: Element) => {
						const result = (options.content as Function)();
						return result;
				  }
				: options.content;

		if (instance != null) {
			// Re-use existing instance, but update the configuration.
			instance.setProps({
				content: tippyContent as any,
				placement: options.placement ?? 'top',
				trigger: options.trigger ?? 'click',
				interactive: options.interactive ?? true,
				maxWidth: options.maxWidth ?? 'none'
			});
		} else {
			instance = tippy(node, {
				content: tippyContent as any,
				allowHTML: true,
				interactive: options.interactive ?? true,
				trigger: options.trigger ?? 'click',
				placement: options.placement ?? 'top',
				maxWidth: options.maxWidth ?? 'none',
				arrow: roundArrow,
				appendTo: () => document.body,
				theme: 'popover'
			});

			popovers.set(node, instance);
		}
	}

	/**
	 * Svelte action to attach a popover to an element.
	 *
	 * Usage:
	 * ```svelte
	 * <button use:popover={{ content: 'Hello!', placement: 'top' }}>
	 *   Click me
	 * </button>
	 * ```
	 */
	export function popover(node: HTMLElement, options: PopoverOptions) {
		process(node, options);

		return {
			destroy() {
				const instance = popovers.get(node);

				if (instance != null) {
					instance.destroy();
					popovers.delete(node);
				}
			},
			update(newOptions: PopoverOptions) {
				process(node, newOptions);
			}
		};
	}
</script>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	/* Tippy popover styling */
	:global(.tippy-box[data-theme~='popover']) {
		background-color: white;
		color: #333;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		padding: 8px 12px;
		font-size: $font-size-base;
		line-height: 1.4em;
		text-align: left;
	}

	:global(.tippy-box[data-theme~='popover'] .tippy-svg-arrow) {
		fill: white;
	}

	:global(.tippy-box[data-theme~='popover'] .tippy-svg-arrow::after) {
		content: '';
		position: absolute;
		z-index: -1;
	}

	:global(.tippy-box[data-theme~='popover'][data-placement^='top'] .tippy-svg-arrow::after) {
		border-top-color: #ccc;
	}

	:global(.tippy-box[data-theme~='popover'][data-placement^='bottom'] .tippy-svg-arrow::after) {
		border-bottom-color: #ccc;
	}

	:global(.tippy-box[data-theme~='popover'][data-placement^='left'] .tippy-svg-arrow::after) {
		border-left-color: #ccc;
	}

	:global(.tippy-box[data-theme~='popover'][data-placement^='right'] .tippy-svg-arrow::after) {
		border-right-color: #ccc;
	}
</style>
