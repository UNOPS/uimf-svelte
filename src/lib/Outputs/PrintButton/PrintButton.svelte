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
		const domElementToPrint = controller.form?.element;

		if (domElementToPrint == null) {
			// Nothing to print.
			return;
		}

		// Create a new window for printing
		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			console.error('Could not open print window. Pop-up blocker may be enabled.');
			return;
		}

		// Clone the element to avoid modifying the original
		const elementClone = domElementToPrint.cloneNode(true) as HTMLElement;

		// Get all stylesheets from the current document
		const stylesheets = Array.from(document.styleSheets);
		let styles: string = ``;

		stylesheets.forEach((stylesheet) => {
			try {
				// Try to access stylesheet rules
				const rules = stylesheet.cssRules || stylesheet.rules;

				if (rules) {
					let rulesArray = Array.from(rules);

					for (let rule of rulesArray) {
						styles += rule.cssText;
					}
				}
			} catch (e) {
				// Cross-origin stylesheets might throw errors, try to include via link
				if (stylesheet.href) {
					styles += `@import url("${stylesheet.href}");\n`;
				}
			}
		});

		styles += `
		@media print {
			* {
				visibility: visible !important;
				box-shadow: none !important;
				text-shadow: none !important;
				opacity: 1 !important;
			}     

			.btn-sm {
				display: none !important;
			}
		}`;

		// Create the document structure using modern DOM APIs properly
		const printDoc = printWindow.document;

		// Work with the existing head and body elements that the browser creates
		const head = printDoc.head;
		const body = printDoc.body;

		// Clear existing content
		head.innerHTML = '';
		body.innerHTML = '';

		// Set title
		const title = printDoc.createElement('title');
		title.textContent = 'Print Preview';
		head.appendChild(title);

		// Create and append styles
		const styleElement = printDoc.createElement('style');
		styleElement.innerHTML = styles;
		head.appendChild(styleElement);

		// Append the cloned element to the body
		body.appendChild(elementClone);

		// Wait for the document to load, then show print preview
		printWindow.onload = () => {
			printWindow.focus();
			printWindow.print();
		};
	}
</script>

{#if controller.value != null}
	<button
		type="button"
		class="rounded-2 my-3 px-4 py-2 btn btn-primary btn-sm"
		on:click={(e) => {
			e.preventDefault();
			print();
		}}>Print</button
	>
{/if}

<style>
</style>
