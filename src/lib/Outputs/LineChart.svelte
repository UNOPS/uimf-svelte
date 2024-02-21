<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import * as d3 from 'd3';

	interface ILineChartData {
		Label: string;
		Value: number;
		Year: Date;
	}
	interface ILineChart {
		Data: ILineChartData[];
	}
	let xScale: any;
	let yScale: any;
	let chartWidth = 640;
	let chartHeight = 500;
	let paddings = {
		top: 50,
		left: 50,
		right: 50,
		bottom: 50
	};

	let data: ILineChartData[] = [];
	export let controller: OutputController<ILineChart>;

	let component = new OutputComponent({
		refresh() {
			if (controller.value) {
				data = controller.value.Data;
				console.log('If block running' + data);
				renderLineChart(controller.value.Data);
			} else console.log('No value');
		}
	});

	function renderLineChart(data: ILineChartData[]) {
		console.log('renderLineChart function called');

		xScale = d3
			.scaleTime()
			.domain(d3.extent(data, (d: { Year: any }) => d.Year))
			.range([paddings.left, chartWidth - paddings.right]);

		yScale = d3
			.scaleLinear()
			.domain([
				d3.min(data, (d: { Value: any }) => d.Value),
				d3.max(data, (d: { Value: any }) => d.Value)
			])
			.range([chartHeight - paddings.bottom, paddings.top])
			.nice(10);
	}

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<svg width={chartWidth} height={chartHeight}>
	<g>
		<line
			x1={paddings.left}
			x2={chartWidth - paddings.right}
			y1={chartHeight - paddings.bottom}
			y2={chartHeight - paddings.bottom}
			stroke="black"
			stroke-width="2"
		/>
		<line
			x1={paddings.left}
			x2={paddings.left}
			y1={paddings.top}
			y2={chartHeight - paddings.bottom}
			stroke="black"
			stroke-width="2"
		/>
	</g>
	<g>
		{#each data as datum, i (datum.Year)}
			{#if i != data.length - 1}
				<line
					x1={xScale(data[i].Year)}
					x2={xScale(data[i + 1].Year)}
					y1={yScale(data[i].Value)}
					y2={yScale(data[i + 1].Value)}
					stroke="red"
					stroke-width="2"
				/>
			{/if}
		{/each}
	</g>
</svg>
