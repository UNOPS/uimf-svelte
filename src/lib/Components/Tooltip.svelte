<script context="module" lang="ts">
	import tippy, { roundArrow } from 'tippy.js';
	import 'tippy.js/dist/svg-arrow.css';

	let tooltips = new Map();

	function process(node: HTMLElement, documentation: any) {
		let content = typeof documentation === 'string' ? documentation : documentation?.Content;

		if (content != null && content != '') {
			let instance = tooltips.get(node);

			if (instance != null) {
				// Re-use existing instance, but just change the content.
				instance.setContent(content);
			} else {
				node.classList.add('has-documentation');

				instance = tippy(node, {
					content: content,
					allowHTML: true,
					delay: [100, 0],
					duration: [0, 0],
					arrow: roundArrow
				});

				tooltips.set(node, instance);
			}
		} else {
			node.classList.remove('has-documentation');

			let instance = tooltips.get(node);

			if (instance != null) {
				instance.destroy();
				tooltips.delete(node);
			}
		}
	}

	export function tooltip(node: HTMLElement, documentation: any) {
		process(node, documentation);

		return {
			destroy() {
				const instance = tooltips.get(node);

				if (instance != null) {
					instance.destroy();
					tooltips.delete(node);
				}
			},
			update(newDocumentation: any) {
				process(node, newDocumentation);
			}
		};
	}
</script>

<style lang="scss">
	@import '../scss/styles.variables.scss';

	:global(.tippy-box) {
		--bg-color: #313131;

		font-size: $font-size-base !important;
		line-height: 1.4em !important;
		border-radius: 2px !important;
		text-align: center;
		background: var(--bg-color);
		color: #f6f6f6;
		padding: 2px 5px;
	}

	:global(.tippy-box ul),
	:global(.tippy-box ol) {
		text-align: left;
		padding: 0;
		margin: 8px 0 8px 25px;
		list-style-position: outside;
	}

	:global(.tippy-box > .tippy-svg-arrow) {
		fill: var(--bg-color);
	}
</style>
