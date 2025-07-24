<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';

	interface PrintButtonData {
		Field: string;
	}

	export let controller: OutputController<PrintButtonData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	/**
	 * Opens browser's native print preview for the DOM element
	 * `controller.form?.element`.
	 */
	function print() {
		const elementToPrint = controller.form?.element;

		if (elementToPrint == null) {
			// Nothing to print.
			return;
		}

		// Create an overlay which will contain the element to be printed.
		// Give it `print` CSS class to make sure it is visible in the
		// print preview (the class is coming from Boostrap CSS).
		const overlay = document.createElement('div');
		overlay.classList.add('print');

		// Clone our DOM element and insert the clone into the overlay.
		const clone = elementToPrint.cloneNode(true);
		overlay.appendChild(clone);

		// Add overlay to the DOM.
		document.body.appendChild(overlay);

		setTimeout(
			function () {
				// For some reason if we don't have a little delay,
				// between amending DOM and calling `window.print()`
				// then images won't be visible in the print preview.
				window.print();

				setTimeout(function () {
					// Remove the print overlay after a short delay,
					// once the native preview window has opened.
					overlay.remove();
				}, 1000);
			},
			// Keep the delay minimal for better user experience, but
			// big enough for print preview to reflect DOM changes.
			100
		);
	}
</script>

{#if controller.value != null}
	<button
		type="button"
		class="btn btn-sm"
		on:click={(e) => {
			e.preventDefault();
			print();
		}}>Print</button
	>
{/if}
