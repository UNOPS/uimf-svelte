<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface ITidyTree {
		Id: number;
		ParentId: number;
		Label: string;
	}
	interface ITidyTreeData {
		Data: ITidyTree[];
	}
	export let controller: OutputController<ITidyTree>;
	export let items: ITidyTreeData[] = [];

	let component = new OutputComponent({
		refresh() {}
	});
	beforeUpdate(async () => await component.setup(controller));
</script>

{#if items != null}{/if}
