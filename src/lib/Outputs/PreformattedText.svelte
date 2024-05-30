<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	interface TextAreaData {
		Text: string;
	}

	export let controller: OutputController<TextAreaData>;

	let textarea: HTMLTextAreaElement;
	let heightInEm = 5;

	const minVisibleLines = 3;
	const maxVisibleLines = 30;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			let lines = controller.value?.Text?.split('\n').length || 1;

			// Show a reasonable number of lines before introducing a scrollbar.
			let linesToShow = Math.max(Math.min(lines, maxVisibleLines), minVisibleLines);

			// One line is 1.2em. This math is not perfect, but it should give
			// us a reasonable approximation and result.
			heightInEm = linesToShow * 1.2;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const copy = () => {
		textarea.focus();
		textarea.select();

		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Unable to copy in PreformattedText.');
		}
	};

	const handleCopyKeydown = (event: { key: string }) => {
		if (event.key === 'Enter') {
			copy();
		}
	};
</script>

<div class="wrapper">
	<div>
		<i
			class="fa fa-copy hand-cursor"
			on:click={copy}
			on:keydown={handleCopyKeydown}
			tabindex="0"
			role="button"
			aria-label="Copy to clipboard"
		/>
	</div>

	<textarea style:height={heightInEm + 'em'} bind:this={textarea} readonly
		>{controller.value?.Text}</textarea
	>
</div>

<style lang="scss">
	.wrapper {
		clear: both;
		border: 1px solid #ccc;
		border-radius: 0 0 2px 2px;

		& > div {
			background: #ececec;
			padding: 10px 20px;
			text-align: right;
		}
	}

	textarea {
		background-color: #f5f5f5;
		border: none;
		border-top: 1px solid #ccc;
		color: #333;
		font-family: monospace;
		margin: 0 0 10px;
		max-width: 100%;
		min-width: 100%;
		min-height: 30px;
		outline: none;
		word-break: break-all;
		word-wrap: break-word;
		margin: 0;
		padding: 10px 15px;
		line-height: 1.2em;
	}
</style>
