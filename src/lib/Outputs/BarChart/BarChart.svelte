<script lang="ts">
	import { OutputComponent } from '../../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface IBarChartData {
		Label: string;
		Value: number;
	}
	interface IBarChart {
		Data: IBarChartData[];
	}

	export let controller: OutputController<IBarChart>;

	let data: IBarChartData[] = [];
	let xScale: { (arg0: string): any; (arg0: string): any; bandwidth: any };
	let yScale: d3.ScaleLinear<number, number, never> | { (arg0: number): number; ticks: () => any };
	let padding = { top: 20, right: 15, bottom: 20, left: 25 };
	let barWidth: number;

	let width = 500;
	let height = 200;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				data = controller.value.Data;
				xScale = d3
					.scaleBand()
					.domain(data.map((d) => d.Label))
					.range([padding.left, width - padding.right])
					.padding(0.2);

				yScale = d3
					.scaleLinear()
					.domain([0, Math.max(...data.map((d) => d.Value))])
					.range([height - padding.bottom, padding.top]);

				innerWidth = width - (padding.left + padding.right);
				barWidth = xScale.bandwidth();
			}
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg>
		{#if yScale}
			<g class="axis y-axis">
				{#each yScale.ticks() as tick}
					<g class="tick" transform={`translate(${padding.left}, ${yScale(tick)})`}>
						<line x2={width - padding.right - padding.left} stroke="#e2e2e2" stroke-dasharray="2" />
						<text x={-20} dy=".1em" text-anchor="end">{tick}</text>
					</g>
				{/each}
			</g>
		{/if}

		<g class="bars">
			{#each data as item}
				<rect
					x={xScale(item.Label)}
					y={yScale(item.Value)}
					width={barWidth}
					height={height - padding.bottom - yScale(item.Value)}
					fill="#a11"
					stroke="none"
				/>
			{/each}
		</g>

		<g class="axis x-axis">
			{#each data as item, i}
				<g class="tick" transform={`translate(${xScale(item.Label)},${height - padding.bottom})`}>
					<text y={barWidth / 2} dy=".71em" text-anchor="end" transform="rotate(-45)">
						{item.Label}
					</text>
				</g>
			{/each}
		</g>
	</svg>
</div>

<style>
	h2 {
		text-align: center;
	}

	.chart {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}

	svg {
		position: relative;
		width: 100%;
		height: 250px;
	}

	.tick {
		font-family: Helvetica, Arial;
		font-size: 0.725em;
		font-weight: 200;
	}

	.tick line {
		stroke: #e2e2e2;
		stroke-dasharray: 2;
	}

	.tick text {
		fill: #000000;
		text-anchor: start;
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}

	.x-axis .tick text {
		text-anchor: middle;
	}

	.bars rect {
		fill: #a11;
		stroke: none;
	}
</style>
