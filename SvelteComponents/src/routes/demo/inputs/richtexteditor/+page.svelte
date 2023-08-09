<script lang="ts">
	import Editor from '$lib/Inputs/RichTextEditor.svelte';
	
    let editor;
</script>

<h1>Inputs / Text</h1>
<Editor bind:this={editor} />
<button on:click={() => alert(editor.getHtml()) } >Get html</button>
