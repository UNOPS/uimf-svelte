<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate, onMount } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';
	import { hierarchy, tree } from 'd3-hierarchy';

	interface ITidyTreeData {
		Id: number;
		ParentId: number | null;
		Label: string;
	}
	interface ITidyTree {
		Node: ITidyTreeData[];
	}
	export let controller: OutputController<ITidyTree>;
	export let items: ITidyTreeData[] = [];

	var margin = {
			top: 20,
			right: 120,
			bottom: 20,
			left: 120
		},
		width = 960 - margin.right - margin.left,
		height = 500 - margin.top - margin.bottom;

	let component = new OutputComponent({
		refresh() {
			if (controller.value.Node) {
				items = controller.value.Node;
				items.forEach((item) => {
					console.log(item.Id + ', ' + item.Label + ', ' + item.ParentId);
				});
				renderTree(items);
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	// Function to render the tidy tree
	function renderTree(items: ITidyTreeData[]) {
		// Create a map of nodes
		let nodeMap = new Map();
		items.forEach((item) => {
			nodeMap.set(item.Id, { ...item, children: [] });
		});

		// Connect children to their parents and connect nodes with no parent to a super parent
		let superParent: ITidyTreeData & { children: ITidyTreeData[] } = {
			Id: -1,
			Label: 'Super Parent',
			ParentId: null,
			children: []
		};
		items.forEach((item) => {
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

		// Create a hierarchy from the root
		let root = d3.hierarchy(superParent);

		// Create a tree layout
		let treeLayout = d3.tree().size([500, 500]);
		treeLayout(root);

		// Now you can use root.leaves() and root.links() to get the positions of the nodes and the links between them
		let svg = d3.select('#tree').append('svg').attr('width', 600).attr('height', 600);

		let g = svg.append('g').attr('transform', 'translate(50,50)');

		let link = g
			.selectAll('.link')
			.data(root.links())
			.enter()
			.append('path')
			.attr('class', 'link')
			.attr(
				'd',
				d3
					.linkVertical()
					.x(function (d: { y: any }) {
						return d.y;
					})
					.y(function (d: { x: any }) {
						return d.x;
					})
			);

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
				return d.data.Label;
			});
	}
</script>

<div id="tree" />

<style>
	.node circle {
		fill: #fff;
		stroke: steelblue;
		stroke-width: 1px;
	}
	.node text {
		font: 12px sans-serif;
	}
	.link {
		fill: none;
		stroke: #ccc;
		stroke-width: 0.5px;
	}
</style>
