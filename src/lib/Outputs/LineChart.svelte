<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface ILineChartData {
		Message: string;
		Value: number;
		Date: Date;
		Category?: string;
	}
	interface ILineChart {
		Data: ILineChartData[];
	}
	// interface PieChartData {
	// 	Label: string;
	// 	Value: number;
	// }
	// interface IPieChartDisplayData extends PieChartData {
	// 	Color: string;
	// 	StartAngle: number;
	// 	EndAngle: number;
	// }

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
	let tooltipContent: ILineChartData | null = null;
	let tooltipX: number = 0;
	let tooltipY: number = 0;
	let hoverTooltip: any = null;

	//Variables for PieChart
	// let pie: any;
	// let arc: any;
	// let pieData: IPieChartDisplayData[] = [];
	// let categoryValueSum: [any, any][];
	// let radius: number;
	// let size = 200;
	// let totalValue = 0;

	export let controller: OutputController<ILineChart>;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				data = controller.value.Data.map((d) => ({ ...d, Date: new Date(d.Date) }));

				const xExtent = d3.extent(data.map((d) => d.Date));
				const yExtent = d3.extent(data.map((d) => d.Value)) as
					| [number, number]
					| [undefined, undefined];
				const yDomain = yExtent[0] === undefined || yExtent[1] === undefined ? [0, 0] : yExtent;
				xScale = d3
					.scaleTime()
					.domain(xExtent[0] === undefined ? [new Date(), new Date()] : xExtent)
					.range([marginLeft, width - marginRight]);

				yScale = d3
					.scaleLinear()
					.domain(yDomain)
					.range([height - marginBottom, marginTop]);

				const dataByCategory = d3.group(data, (d) => d.Category);

				paths = Array.from(dataByCategory, ([category, values]) => {
					const pathGenerator = d3
						.line<ILineChartData>()
						.x((d) => xScale(d.Date))
						.y((d) => yScale(d.Value));

					const pathData = pathGenerator(values);
					return {
						d: pathData || '',
						label: category || 'Unknown'
					};
				});
				// categoryValueSum = d3.rollups(
				// 	data,
				// 	(v) => d3.sum(v, (d) => d.Value),
				// 	(d) => d.Category ?? 'Unknown'
				// );

				// pieData = categoryValueSum.map(([Label, Value], i) => ({
				// 	Label,
				// 	Value
				// }));
				// console.log(pieData);
				// let accumulatedValue = 0;
				// totalValue = pieData.reduce((total, item) => total + item.Value, 0);
				// pieData.forEach((item, i) => {
				// 	item.Value = (item.Value / totalValue) * 100;
				// 	item.StartAngle = (2 * Math.PI * accumulatedValue) / 100;
				// 	item.EndAngle = (2 * Math.PI * (accumulatedValue + item.Value)) / 100;
				// 	accumulatedValue += item.Value;
				// 	item.Color = controller.app.colorFromString(item.Label, {
				// 		format: 'cmyk',
				// 		alpha: 1,
				// 		luminosity: 'bright'
				// 	});
				// });
			}
		}
	});
	function colorByIndex(index: number) {
		const colors = ['steelblue', 'red', 'green', 'purple', 'orange'];
		return colors[index % colors.length];
	}
	function uniqueTicks(ticks: number[]): number[] {
		return [...new Set(ticks.map((tick) => Math.round(tick)))];
	}
	function showTooltip(point: any) {
		hoverTooltip = point;
	}
	function hideTooltip() {
		hoverTooltip = null;
	}
	function onMouseEnter(event: MouseEvent, d: ILineChartData) {
		if (event.currentTarget instanceof SVGGraphicsElement && event.currentTarget.ownerSVGElement) {
			const svg = event.currentTarget.ownerSVGElement;
			const ctm = svg.getScreenCTM();
			if (ctm) {
				tooltipX = event.clientX;
				tooltipY = event.clientY - 5;
				tooltipContent = d;
				showTooltip(d);
			} else {
				console.error('Unable to get the screen CTM');
			}
		}
	}
	function onFocus(d: ILineChartData) {
		showTooltip(d);
	}
	function onMouseLeave() {
		hideTooltip();
	}

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div class="container">
	{#if xScale && yScale}
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
					<text fill="currentColor" text-anchor="middle" x={xScale(tick)} y={22}>
						{d3.timeFormat('%d %b')(tick)}
					</text>
				{/each}
			</g>

			<g transform="translate({marginLeft},0)">
				{#each uniqueTicks(yScale.ticks(10).concat([0])) as tick}
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
						{Math.round(tick)}
					</text>
				{/each}
			</g>
			<g
				class="legend"
				transform={`translate(${width / 2 - (paths.length * 100) / 2},${height + 30})`}
			>
				{#each paths as { label }, index (label)}
					<g transform={`translate(${index * 100}, 0)`}>
						<rect width="20" height="20" fill={colorByIndex(index)} />
						<text x="25" y="15" font-size="1em">{label}</text>
					</g>
				{/each}
			</g>

			{#each paths as { d, label }, index (label)}
				<path fill="none" stroke={colorByIndex(index)} stroke-width="1.5" {d} />
				{#each data as point, i}
					<circle
						cx={xScale(point.Date)}
						cy={yScale(point.Value)}
						r="5"
						fill="#000"
						tabindex="0"
						role="button"
						aria-label={`Value: ${point.Value}, Date: ${point.Date.toDateString()}`}
						on:mouseover={(event) => onMouseEnter(event, point)}
						on:mouseout={onMouseLeave}
						on:focus={() => onFocus(point)}
						on:blur={onMouseLeave}
					/>
				{/each}
			{/each}
		</svg>
	{/if}
	{#if hoverTooltip}
		<div class="tooltip" style="left: {tooltipX + 10}px; top: {tooltipY}px;">
			<strong>Total Errors:</strong>
			{hoverTooltip.Value}<br />
			<strong>Date:</strong>
			{hoverTooltip.Date.toDateString()}<br />
			<strong>Errors:</strong><br />
			<pre>{@html hoverTooltip.Message}</pre>
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex: 1;
		justify-content: center;
		align-items: center;
	}
	.legend text {
		fill: currentColor;
		font-size: 16px;
	}
	.tooltip {
		position: fixed;
		padding: 10px;
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
		transform: translate(-50%, -100%);
		pointer-events: none;
		white-space: nowrap;
		display: block;
		opacity: 1;
	}
</style>
