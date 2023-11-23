<script lang="ts" context="module">
	interface Network {
		States: State[];
		Transitions: Transition[];
		CurrentStateId: number;
	}

	interface State {
		Id: number;
		Name: string;
	}

	interface Node {
		x: number;
		y: number;
		width: number;
		height: number;
		Id: number;
		Name: string;
		links: any[];
	}

	interface Transition {
		From: number;
		To: number;
		Name: string;
		Position: Position;
	}

	interface TextPosition {
		x: number;
		y: number;
	}

	interface Position {
		sourceNode: Node;
		targetNode: Node;
		points: string;
		text: TextPosition;
	}
</script>

<script lang="ts">
	import { digl } from '@crinkles/digl';
	import type { Rank } from '@crinkles/digl/dist/types';
	import { onMount } from 'svelte';
	import Panzoom from '@panzoom/panzoom';

	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<Network>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const edges = controller.value.Transitions.map((t) => {
		return {
			source: t.From.toString(),
			target: t.To.toString()
		};
	});

	const states = controller.value.States.map((t) => {
		return {
			...t,
			width: 5 * t.Name.length + 50,
			height: 40
		};
	});

	let stateDiagramSvg: SVGSVGElement;

	let nodes: Node[] = [];
	let links: Transition[] = [];

	let graphHeight = 1;

	/**
	 * Draws the diagram based on the ranks
	 * @param ranks the 2d array that describes rows and columns of the diagram
	 * @return an array of nodes that contains original data, width, height, and x,y coordinates
	 */
	const drawDiagram = (ranks: Rank[]) => {
		graphHeight = ranks.map((r) => r.length).reduce((a, b) => Math.max(a, b));
		const width = 90 + (ranks.filter((t) => t.length == 1).length > 0 ? 10 : 0); //the ternary adds more width for graphs that are going to have straight lines
		const height = 40;

		const nodesToReturn: Node[] = [];

		//construct node positions
		ranks.forEach((rank, i) => {
			const xStart = 2 * width * i;
			const yStart = -0.5 * (rank.length - 1) * 2 * height;

			rank.forEach((id, j) => {
				const node = states.find((n) => n.Id.toString() === id)!;
				const x = xStart;
				const y = yStart + 2 * height * j;

				nodesToReturn.push({
					...node,
					links: [],
					x: x,
					y: y
				});
			});
		});

		return nodesToReturn;
	};

	/**
	 * Gets the points for the link
	 * @param link the link to get the points for
	 * @param heightDelta the height delta to add to the link
	 * @return the points for the link
	 */
	const getAllPoints = (transitions: Transition[]) => {
		const links: Transition[] = [];
		for (let transition of transitions) {
			let numberOfTraffics = links.filter((link) => {
				return (
					(link.Position.sourceNode.Id.toString() == transition.From.toString() &&
						link.Position.targetNode.Id.toString() == transition.To.toString()) ||
					(link.Position.sourceNode.Id.toString() == transition.To.toString() &&
						link.Position.targetNode.Id.toString() == transition.From.toString())
				);
			}).length;
			let delta = -20 * numberOfTraffics;
			links.push({
				...transition,
				Position: getPoints(transition, delta)
			});
		}
		return links;
	};

	/**
	 * Gets the points for the link
	 * @param link the link to get the points for
	 * @param heightDelta the height delta to add to the link
	 * @return the points for the link
	 */
	const getPoints = (link: Transition, heightDelta = 0) => {
		const sourceNode = nodes.find((n) => n.Id.toString() === link.From.toString())!;
		const targetNode = nodes.find((n) => n.Id.toString() === link.To.toString())!;

		let sourceX;
		let sourceY;
		let targetX;
		let targetY;

		let distance = -50 - heightDelta;
		let flipText = 1;

		let points: string;

		let text: TextPosition;

		//2 points case for source and target with same y coordinates
		if (sourceNode.y == targetNode.y && sourceNode.Id < targetNode.Id && link.Name.length <= 15) {
			sourceX = sourceNode.x + sourceNode.width;
			sourceY = (sourceNode.y + sourceNode.height) / 2;
			targetX = targetNode.x;
			targetY = (targetNode.y + targetNode.height) / 2;
			points = `${sourceX}, ${sourceY} ${targetX}, ${targetY}`;
			text = {
				x: (sourceX + targetX) / 2,
				y: targetY + distance / 5
			};
		} else {
			//4 points case for source and target with different y coordinates
			if (sourceNode.y > 0 || targetNode.y > 0) {
				sourceX = sourceNode.x + sourceNode.width / 2;
				sourceY = sourceNode.y + sourceNode.height;
				targetX = targetNode.x + targetNode.width / 2;
				targetY = targetNode.y + sourceNode.height;
				distance = 50 + heightDelta;
				flipText = -1;
			} else {
				sourceX = sourceNode.x + sourceNode.width / 2;
				sourceY = sourceNode.y;
				targetX = targetNode.x + targetNode.width / 2;
				targetY = targetNode.y;
			}

			if (sourceNode.Id < targetNode.Id) {
				sourceX += 15;
				targetX -= 30;
			} else {
				sourceX -= 50;
				targetX += 30;
			}

			points = `${sourceX},${sourceY} ${sourceX},${targetY + distance} ${targetX}, ${
				targetY + distance
			} ${targetX}, ${targetY}`;

			text = {
				x: (sourceX + targetX) / 2,
				y: targetY + distance - flipText * 10
			};
		}

		return {
			sourceNode,
			targetNode,
			points,
			text
		};
	};

	let ranks = digl(edges);
	nodes = drawDiagram(ranks[0]);
	links = getAllPoints(controller.value.Transitions);

	onMount(() => {
		function getSvgElement() {
			return new Promise((resolve: any) => {
				const checkElement = () => {
					const element = stateDiagramSvg;
					if (element !== null) {
						resolve(element);
					} else {
						setTimeout(checkElement, 50);
					}
				};

				checkElement();
			});
		}

		getSvgElement().then((element: SVGSVGElement) => {
			const panzoom = Panzoom(element, {
				contain: 'outside'
			});

			element.addEventListener('wheel', panzoom.zoomWithWheel);
		});
	});
</script>

<div>
	<svg
		bind:this={stateDiagramSvg}
		style="width: 100%; height: 100%;"
		height={window.innerHeight / (5.5 - graphHeight / 2)}
	>
		<defs>
			<marker
				id="arrow"
				markerWidth="10"
				markerHeight="10"
				refX="8"
				refY="3"
				orient="auto"
				markerUnits="strokeWidth"
			>
				<path d="M0,0 L0,6 L9,3 z" fill="#9BC1CF" />
			</marker>
		</defs>
		<g
			transform={`translate(${window.innerWidth / (12 - (10 - nodes.length))}, 100) scale(${
				(nodes.length / 10 + 0.1 * window.innerWidth) / ((200 + nodes.length * 5) + 2000 / window.innerWidth)
			})`}
		>
			{#each nodes as n}
				<g
					class={n.Id === controller.value.CurrentStateId ? 'selected-node' : 'node'}
					transform={`translate(${n.x},${n.y})`}
				>
					<rect width={n.width} height={n.height} x="0" y="0" rx="5" ry="5" />
					<text class="text" x={n.width / 2} y={n.height / 2} alignment-baseline="middle">
						{n.Name}
					</text>
				</g>
			{/each}
			{#each links as link}
				<polyline
					class={link.From > link.To ? 'dashed-link' : 'link'}
					points={link.Position.points}
					marker-end="url(#arrow)"
				/>
				<text
					transform={`translate(${link.Position.text.x},${link.Position.text.y})`}
					class="link-text"
					startOffset="50%"
				>
					{link.Name}
				</text>
			{/each}
		</g>
	</svg>
</div>

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	.link {
		fill: none;
		stroke: #9bc1cf;
		stroke-width: 1.5px;
	}

	.dashed-link {
		fill: none;
		stroke: #9bc1cf;
		stroke-width: 1.5px;
		stroke-dasharray: 5, 5;
	}

	.link-text {
		font-size: 12px;
		fill: #9bc1cf;
		text-anchor: middle;
	}

	.node rect {
		fill: $primary;
	}

	.node text {
		font-size: 14px;
		fill: white;
		text-anchor: middle;
	}

	.selected-node rect {
		fill: #5151e8;
	}

	.selected-node text {
		font-size: 14px;
		fill: white;
		text-anchor: middle;
	}
</style>
