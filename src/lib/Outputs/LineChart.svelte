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
	let tooltipContent: ILineChartData | null = null;
	let tooltipX: number = 0;
	let tooltipY: number = 0;
	let hoverTooltip: any = null;

	export let controller: OutputController<ILineChart>;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				data = controller.value.Data.map((d) => ({ ...d, Date: new Date(d.Date) }));
				const xExtent = d3.extent(data.map((d) => d.Date));
				const yExtent = d3.extent(data.map((d) => d.Value));
				xScale = d3
					.scaleTime()
					.domain(xExtent[0] === undefined ? [new Date(), new Date()] : xExtent)
					.range([marginLeft, width - marginRight]);

				yScale = d3
					.scaleLinear()
					.domain(yExtent[0] === undefined ? [0, 0] : yExtent)
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
			{#each uniqueTicks(yScale.ticks()) as tick}
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
		<strong>Error Count:</strong>
		{hoverTooltip.Value}<br />
		<strong>Date:</strong>
		{hoverTooltip.Date.toDateString()}<br />
		<strong>Category:</strong>
		{hoverTooltip.Category}
	</div>
{/if}

<style>
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
