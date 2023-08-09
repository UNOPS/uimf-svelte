<script lang="ts">
	import type { editor } from 'monaco-editor/esm/vs/editor/editor.api';
	import { beforeUpdate, onMount } from 'svelte';
	export let code: string;
	let editor : editor.IStandaloneCodeEditor | null = null
	let container: HTMLElement;
    export let onUpdateCode: (code: string) => any

	onMount(() => {
		import('monaco-editor/esm/vs/editor/editor.api').then((monaco) => {
            editor = monaco.editor.create(container, {
				value: code,
				language: 'javascript',
                scrollBeyondLastLine: false,
                theme: "vs-dark",
			});
		});
	});

    beforeUpdate(() => {
        editor?.setValue(code);
    })
</script>

<div style="height:25vh;" bind:this={container} />

<button class="btn btn-primary" on:click={() => {
    onUpdateCode(editor?.getValue() ?? code);
}}>Update component</button>

<style>
    .btn {
        margin-top: 2%;
    }
    
	#editor-container {
		height: 400px;
	}
</style>
