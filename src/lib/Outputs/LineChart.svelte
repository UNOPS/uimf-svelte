<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface ILineChartData {
		Label: string;
		Value: number;
		Date: Date;
		Category?: string;
	}
	interface ILineChart {
		Data: ILineChartData[];
	}

	let xScale: any;
	let yScale: any;
	let width = 928;
	let height = 500;
	let marginTop = 20;
	let marginRight = 30;
	let marginBottom = 30;
	let marginLeft = 40;
	let data: ILineChartData[] = [];
	let paths: { d: string; label: string }[] = [];
	export let controller: OutputController<ILineChart>;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				data = controller.value.Data.map((d) => ({ ...d, Date: new Date(d.Date) }));
				console.log(data);
				const xExtent = d3.extent(data.map((d) => d.Date.getFullYear()));
				const yExtent = d3.extent(data.map((d) => d.Value));
				xScale = d3
					.scaleLinear()
					.domain(xExtent[0] === undefined ? [0, 0] : xExtent)
					.range([marginLeft, width - marginRight]);

				yScale = d3
					.scaleLinear()
					.domain(yExtent[0] === undefined ? [0, 0] : yExtent)
					.range([height - marginBottom, marginTop]);

				const dataByCategory = d3.group(data, (d) => d.Category);

				paths = Array.from(dataByCategory, ([category, values]) => {
					const pathGenerator = d3
						.line<ILineChartData>()
						.x((d) => xScale(d.Date.getDate()))
						.y((d) => yScale(d.Value))
						.curve(d3.curveBasis);

					const pathData = pathGenerator(values);
					return {
						d: pathData || '',
						label: category || 'Unknown'
					};
				});
			}
		}
	});
	function colorByIndex(index: number) {
		const colors = ['steelblue', 'red', 'green', 'purple', 'orange'];
		return colors[index % colors.length];
	}
	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

{#if xScale && yScale}
	<h2>{data[0].Label}</h2>
	<svg
		{width}
		{height}
		viewBox="0 0 {width} {height + 50}"
		style:max-width="100%"
		style:height="auto"
	>
		<g transform="translate(0,{height - marginBottom})">
			<line stroke="currentColor" x1={marginLeft - 6} x2={width} />

			{#each xScale.ticks() as tick}
				<line stroke="currentColor" x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={6} />
				<text fill="currentColor" text-anchor="middle" x={xScale(tick)} y={22}>
					{tick}
				</text>
			{/each}
		</g>

		<g transform="translate({marginLeft},0)">
			{#each yScale.ticks() as tick}
				{#if tick !== 0}
					<line
						stroke="currentColor"
						stroke-opacity="0.1"
						x1={0}
						x2={width - marginLeft}
						y1={yScale(tick)}
						y2={yScale(tick)}
					/>
					<line stroke="currentColor" x1={0} x2={-6} y1={yScale(tick)} y2={yScale(tick)} />
				{/if}
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
		</g>
		<g
			class="legend"
			transform={`translate(${width / 2 - (paths.length * 100) / 2},${height + 30})`}
		>
			{#each paths as { d, label }, index (label)}
				<g transform={`translate(${index * 100}, 0)`}>
					<rect width="20" height="20" fill={colorByIndex(index)} />
					<text x="25" y="15" font-size="1em">{label}</text>
				</g>
			{/each}
		</g>

		{#each paths as { d, label }, index (label)}
			<path fill="none" stroke={colorByIndex(index)} stroke-width="1.5" {d} />
		{/each}
	</svg>
{/if}

<style>
	h2 {
		text-align: center;
	}
	path {
		stroke-width: 1.5;
		fill: none;
		stroke-linecap: round;
	}
	.legend text {
		fill: currentColor;
		font-size: 16px;
	}
</style>
