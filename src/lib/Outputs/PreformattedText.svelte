<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';

	interface TextAreaData {
		Text: string;
	}

	export let controller: OutputController<TextAreaData>;

	let textarea: HTMLTextAreaElement;
    let height = 100;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
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

    onMount(() => {
        height = Math.min(textarea.scrollHeight || 100, 500);
    })
</script>

<div class="div">
	<i class="fa fa-copy hand-cursor" on:click={copy} />
</div>
<textarea
    class="text-area"
	style={`height: ${height}px;`}
	bind:this={textarea}
	readonly>{controller.value?.Text}</textarea
>

<style lang="scss">
	.text-area {
		background-color: #f5f5f5;
		border: 1px solid #ccc;
		border-radius: 0 0 2px 2px;
		border-top: 0;
		color: #333;
		display: block;
		font-size: 13px;
		line-height: 1.42857143;
		margin: 0 0 10px;
		max-width: 100%;
		min-height: 150px;
		min-width: 100%;
		outline: none;
		padding: 9.5px;
		word-break: break-all;
		word-wrap: break-word;
	}

	.div {
		background: #ececec;
		border: 1px solid #e9e9e9;
		border-radius: 2px;
		font-size: 1.5em;
		margin-bottom: -5px;
		padding: 3px 20px 8px;
		text-align: right;
	}
</style>
