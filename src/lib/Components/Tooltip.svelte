<script context="module" lang="ts">
	import tippy from 'sveltejs-tippy';

	let tooltips = new Map();

	function process(node: HTMLElement, documentation: any) {
		if (documentation != null) {
			var content = typeof documentation === 'string' ? documentation : documentation.Content;

			if (content == null || content.length === 0) {
				return;
			}

			if (tooltips.get(node) != null) {
				// Re-use existing instance, but just change the content.
				tooltips.get(node).setContent(content);
			} else {
				node.classList.add('has-documentation');

				const instance = tippy(node, {
					content: content,
					allowHTML: true
				});

				tooltips.set(node, instance);
			}
		} else {
			node.classList.remove('has-documentation');

			var instance = tooltips.get(node);
			if (instance != null) {
				instance.destroy();
				tooltips.delete(node);
			}
		}
	}

	export function tooltip(node: HTMLElement, documentation: any) {
		process(node, documentation);

		return {
			destroy() {},
			update(newDocumentation: any) {
				process(node, newDocumentation);
			}
		};
	}
</script>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	:global(.tippy-box) {
		font-size: $font-size-base !important;
		line-height: 1.4em !important;
		border-radius: 2px !important;
		text-align: center;

		ul {
			text-align: left;
			padding: 0 0 0 20px;
			margin: 8px 0;
			list-style-position: outside;
		}
	}
</style>
