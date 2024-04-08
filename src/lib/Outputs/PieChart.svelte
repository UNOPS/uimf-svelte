<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface IPieChartData {
		Label: string;
		Value: number;
	}

	interface IPieChartDisplayData extends IPieChartData {
		Color: string;
	}

	interface IPieChart {
		Data: IPieChartDisplayData[];
	}

	export let controller: OutputController<IPieChart>;
	let items: IPieChartDisplayData[] = [];

	let width = 500;
	let height = 500;
	let arcs: {
		label: string;
		d: string | null;
		startAngle: number;
		endAngle: number;
		centroid: [number, number];
	}[];
	let colourScale: d3.ScaleOrdinal<string, unknown, never> | ((arg0: any) => any);
	let pieArc = d3.arc();
	let accumulatedAngle = 0;
	let angle = Math.PI * 2;
	let total: number;

	let component = new OutputComponent({
		refresh() {
			if (controller.value?.Data != null) {
				items = controller.value.Data;
				total = items.reduce((total, s) => total + s.Value, 0);
				colourScale = d3.scaleOrdinal(d3.schemeCategory10).domain(items.map((d) => d.Label));

				arcs = items.map((item) => {
					const options = {
						innerRadius: 0,
						outerRadius: 35,
						startAngle: accumulatedAngle,
						endAngle: (accumulatedAngle += (angle * item.Value) / total)
					};

					return {
						label: item.Label,
						d: pieArc(options),
						startAngle: options.startAngle,
						endAngle: options.endAngle,
						centroid: pieArc.centroid(options)
					};
				});
			} else {
				items = [];
			}
			controller.value = controller.value;
		}
	});
	beforeUpdate(async () => await component.setup(controller));
</script>

{#if items.length > 0}
	<div class="container">
		<svg {width} {height} viewBox="0 0 100 100" style:max-width="100%" style:height="auto">
			<g transform="translate(50,50)">
				{#each arcs as arc}
					<path d={arc.d} fill={colourScale(arc.label)} />
				{/each}
			</g>
		</svg>
		<div class="legend">
			{#each arcs as arc}
				<div class="legend-item">
					<span class="color-box" style="background-color: {colourScale(arc.label)}" />
					<strong>{(((arc.endAngle - arc.startAngle) / (2 * Math.PI)) * 100).toFixed(1)}%</strong>: {arc.label}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style lang="scss">
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	text {
		font-weight: bold;
		font-size: 3px;
		text-anchor: middle;
	}
	path {
		stroke: white;
	}
	.legend {
		margin-left: 20px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		margin-bottom: 5px;
	}

	.color-box {
		width: 20px;
		height: 20px;
		display: inline-block;
		margin-right: 10px;
	}
</style>
