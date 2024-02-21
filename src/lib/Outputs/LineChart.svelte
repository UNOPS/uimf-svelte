<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';
	import { curveBasis, line } from 'd3';

	interface ILineChartData {
		Label: string;
		Value: number;
		Year: number;
	}
	interface ILineChart {
		Data: ILineChartData[];
	}
	let pathLine = line<ILineChartData>()
		.x((d) => 0)
		.y((d) => 0)
		.curve(curveBasis);
	let xScale: any;
	let yScale: any;
	let width = 928;
	let height = 500;
	let marginTop = 20;
	let marginRight = 30;
	let marginBottom = 30;
	let marginLeft = 40;
	let data: ILineChartData[] = [];

	export let controller: OutputController<ILineChart>;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				data = controller.value.Data;
				console.log(data);
				if (data[1] && data[1].Year) {
					console.log(data[1].Year);
				}
				const xExtent = d3.extent(data.map((d) => +d.Year));

				const yExtent = d3.extent(data.map((d) => d.Value));
				console.log(data[0].Year, data[0].Value);
				xScale = d3
					.scaleLinear()
					.domain(xExtent[0] === undefined ? [0, 0] : xExtent)
					.range([marginLeft, width - marginRight]);

				yScale = d3
					.scaleLinear()
					.domain(yExtent[0] === undefined ? [0, 0] : yExtent)
					.range([height - marginBottom, marginTop]);
				// the path generator
				pathLine = d3
					.line<ILineChartData>()
					.x((d) => xScale(d.Year))
					.y((d) => yScale(d.Value))
					.curve(d3.curveBasis);
			} else console.log('No value');
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

{#if xScale && yScale}
	<svg {width} {height} viewBox="0 0 {width} {height}" style:max-width="100%" style:height="auto">
		<!-- X-Axis -->
		<g transform="translate(0,{height - marginBottom})">
			<line stroke="currentColor" x1={marginLeft - 6} x2={width} />

			{#each xScale.ticks() as tick}
				<!-- X-Axis Ticks -->
				<line stroke="currentColor" x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={6} />

				<!-- X-Axis Tick Labels -->
				<text fill="currentColor" text-anchor="middle" x={xScale(tick)} y={22}>
					{tick}
				</text>
			{/each}
		</g>

		<!-- Y-Axis and Grid Lines -->
		<g transform="translate({marginLeft},0)">
			{#each yScale.ticks() as tick}
				{#if tick !== 0}
					<!-- 
          Grid Lines. 
          Note: First line is skipped since the x-axis is already present at 0. 
        -->
					<line
						stroke="currentColor"
						stroke-opacity="0.1"
						x1={0}
						x2={width - marginLeft}
						y1={yScale(tick)}
						y2={yScale(tick)}
					/>

					<!-- 
          Y-Axis Ticks. 
          Note: First tick is skipped since the x-axis already acts as a tick. 
        -->
					<line stroke="currentColor" x1={0} x2={-6} y1={yScale(tick)} y2={yScale(tick)} />
				{/if}

				<!-- Y-Axis Tick Labels -->
				<text
					fill="currentColor"
					text-anchor="end"
					dominant-baseline="middle"
					x={-9}
					y={yScale(tick)}
				>
					{tick}
				</text>
			{/each}

			<!-- Y-Axis Label -->
			<text fill="currentColor" text-anchor="start" x={-marginLeft} y={15}>
				{data[0].Label}
			</text>
		</g>

		<path fill="none" stroke="steelblue" stroke-width="1.5" d={pathLine(data)} />
	</svg>
{/if}

<style>
	path {
		stroke: rgb(0, 7, 143);
		stroke-width: 1.5;
		fill: none;
		stroke-linecap: round;
	}
</style>
