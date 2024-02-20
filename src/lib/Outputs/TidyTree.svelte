<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface ITidyTreeData {
		Id: number;
		ParentId: number | null;
		Label: string;
	}
	interface ITidyTree {
		Node: ITidyTreeData[];
	}
	export let controller: OutputController<ITidyTree>;
	let svgContainer: HTMLElement | null = null;
	let nullContainer: HTMLElement;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				renderTree(controller.value.Node);
			} else nullContainer.innerHTML = 'Data not found';
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function renderTree(items: ITidyTreeData[]) {
		let nodeMap = new Map();
		let superParent: ITidyTreeData & { children: ITidyTreeData[] } = {
			Id: -1,
			Label: 'Super Parent',
			ParentId: null,
			children: []
		};
		items.forEach((item) => {
			nodeMap.set(item.Id, { ...item, children: [] });
			let node = nodeMap.get(item.Id);
			if (item.ParentId === null) {
				superParent.children.push(node);
			} else {
				let parent = nodeMap.get(item.ParentId);
				if (parent) {
					parent.children.push(node);
				}
			}
		});

		let root = d3.hierarchy(superParent) as d3.HierarchyNode<unknown>;
		let treeLayout = d3.tree().size([500, 500]);
		treeLayout(root);

		// Fit letters to image; up to 15 chars
		let svg = d3.select(svgContainer).append('svg').attr('width', 600).attr('height', 600);

		let g = svg.append('g').attr('transform', 'translate(50,50)');
		let curve = function (d: d3.HierarchyLink<unknown>) {
			let source = d.source as any;
			let target = d.target as any;
			return `M${source.y},${source.x} L${target.y},${target.x}`;
		};

		g.selectAll('.link')
			.data(root.links())
			.enter()
			.append('path')
			.style('stroke', 'grey')
			.style('stroke-width', '1.5px')
			.attr('d', curve);

		let node = g
			.selectAll('.node')
			.data(root.descendants())
			.enter()
			.append('g')
			.attr('class', function (d) {
				return 'node' + (d.children ? ' node--internal' : ' node--leaf');
			})
			.attr('transform', function (d) {
				let node = d as any;
				return 'translate(' + node.y + ',' + node.x + ')';
			});

		node.append('circle').attr('r', 5);

		node
			.append('text')
			.attr('dx', '5px')
			.attr('x', function (d) {
				return d.children ? -10 : 10;
			})
			.style('text-anchor', (d) => (d.children ? 'end' : 'start'))
			.text(function (d) {
				let data = d.data as ITidyTreeData;
				return data.Label.length > 15 ? data.Label.substring(0, 15) + '...' : data.Label;
			});
	}
</script>

<div bind:this={svgContainer} />
<div bind:this={nullContainer} />

<style>
	.node circle {
		fill: #000000;
		stroke-width: 1px;
	}
	.node text {
		font: 12px sans-serif;
	}
</style>
