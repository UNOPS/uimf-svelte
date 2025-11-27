<script context="module" lang="ts">
	export type AsyncClickHandler = (event: MouseEvent) => Promise<void>;

	export function onAsyncClick(node: HTMLButtonElement, handler: AsyncClickHandler) {
		let currentHandler = handler;

		async function handleClick(event: MouseEvent) {
			if (node.disabled) return;

			node.disabled = true;

			try {
				await currentHandler(event);
			} finally {
				node.disabled = false;
			}
		}

		node.addEventListener('click', handleClick);

		return {
			destroy() {
				node.removeEventListener('click', handleClick);
			},
			update(newHandler: AsyncClickHandler) {
				currentHandler = newHandler;
			}
		};
	}
</script>
