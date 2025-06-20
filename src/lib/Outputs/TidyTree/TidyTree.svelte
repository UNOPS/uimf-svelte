<script lang="ts">
	import { OutputComponent } from '../../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface ITree {
		Nodes: INode[];
	}

	interface INode {
		Id: number;
		ParentId: number | null;
		Label: string;
		Url: string | null;
		CssClass: string | null;
	}

	export let controller: OutputController<ITree>;

	let div: HTMLElement;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				let chart = Tree(controller.value.Nodes, {
					width: div.clientWidth - 100
				});

				if (chart != null) {
					div.replaceChildren();
					div.appendChild(chart);
				}
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function Tree(
		data: INode[],
		{
			width = 800,
			height,
			r = 3, // radius of nodes
			padding = 1, // horizontal padding for first and last column
			fill = '#999', // fill for nodes
			stroke = '#555' // stroke for links
		}: {
			width?: number;
			height?: number;
			r?: number;
			padding?: number;
			fill?: string;
			stroke?: string;
		} = {}
	) {
		// Build hierarchical tree (aka stratify).
		const root = d3
			.stratify<INode>()
			.id((t) => t.Id.toString())
			.parentId((t) => t.ParentId?.toString())(data);

		// Compute labels and titles.
		const descendants = root.descendants();
		const L = descendants.map((d) => d.data.Label);

		// Compute the layout.
		const dx = 15;
		const dy = width / (root.height + padding);
		d3.tree<INode>().nodeSize([dx, dy])(root);

		const rootPoints = root as unknown as d3.HierarchyPointNode<INode>;

		// Center the tree.
		let x0 = Infinity;
		let x1 = -x0;
		rootPoints.each((d) => {
			if (d.x > x1) x1 = d.x;
			if (d.x < x0) x0 = d.x;
		});

		// Compute the default height.
		if (height === undefined) height = x1 - x0 + dx * 2;

		// Use the required curve
		const svg = d3
			.create('svg')
			.attr('viewBox', [(-dy * padding) / 2, x0 - dx, width, height])
			.attr('width', width)
			.attr('height', height)
			.attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
			.attr('font-family', 'sans-serif')
			.attr('font-size', 10);

		svg
			.append('g')
			.attr('fill', 'none')
			.attr('stroke', stroke)
			.attr('stroke-opacity', 0.4)
			.attr('stroke-width', 1.5)
			.selectAll('path')
			.data(rootPoints.links())
			.join('path')
			.attr(
				'd',
				d3
					.link<any, d3.HierarchyPointNode<INode>>(d3.curveBumpX)
					.x((d) => d.y)
					.y((d) => d.x)
			);

		const node = svg
			.append('g')
			.selectAll('a')
			.data(rootPoints.descendants())
			.join('a')
			.attr('class', (d) => d.data.CssClass)
			.attr('xlink:href', (d) => d.data.Url)
			.attr('target', (d) => (d.data.Url != null ? '_self' : null))
			.attr('transform', (d) => `translate(${d.y},${d.x})`);

		node
			.append('circle')
			.attr('fill', (d) => (d.children ? stroke : fill))
			.attr('r', r);

		// Set tooltip.
		node.append('title').text((n) =>
			n
				.ancestors()
				.reverse()
				.map((d) => d.data.Label)
				.join(' / ')
		);

		if (L) {
			node
				.append('text')
				.attr('dy', '0.32em')
				.attr('x', (d) => (d.children ? -6 : 6))
				.attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
				.attr('paint-order', 'stroke')
				.attr('stroke', '#fff')
				.attr('stroke-width', 3)
				.text((d, i) => L[i]);
		}

		return svg.node();
	}
</script>

<div bind:this={div} />

<style>
	div :global(svg a) {
		text-decoration: none;
	}

	div :global(.current > text) {
		paint-order: stroke !important;
		stroke: aquamarine !important;
	}
</style>
