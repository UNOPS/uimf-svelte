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

		let root = d3.hierarchy(superParent);
		let treeLayout = d3.tree().size([500, 500]);
		treeLayout(root);

		// Fit letters to image; up to 15 chars
		let svg = d3.select(svgContainer).append('svg').attr('width', 600).attr('height', 600);

		let g = svg.append('g').attr('transform', 'translate(50,50)');
		let curve = function (d: { source: { y: any; x: any }; target: { y: any; x: any } }) {
			return `M${d.source.y},${d.source.x} L${d.target.y},${d.target.x}`;
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
			.attr('class', function (d: { children: any }) {
				return 'node' + (d.children ? ' node--internal' : ' node--leaf');
			})
			.attr('transform', function (d: { x: string; y: string }) {
				return 'translate(' + d.y + ',' + d.x + ')';
			});

		node.append('circle').attr('r', 5);

		node
			.append('text')
			.attr('dx', '5px')
			.attr('x', function (d: { children: any }) {
				return d.children ? -10 : 10;
			})
			.style('text-anchor', (d: { children: any }) => (d.children ? 'end' : 'start'))
			.text(function (d: { data: { Label: any } }) {
				return d.data.Label.length > 15 ? d.data.Label.substring(0, 15) + '...' : d.data.Label;
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
