<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';

	interface IPieChartData {
		Color: string;
		Label: string;
		Value: number;
	}

	interface IPieChartDisplayData extends IPieChartData {
		Color: string;
		StartAngle: number;
		EndAngle: number;
	}

	interface IPieChart {
		Data: IPieChartDisplayData[];
	}

	let accumulatedValue = 0;
	export let size = 200; //size for PieChart
	export let controller: OutputController<IPieChart>;

	let component = new OutputComponent({
		refresh() {
			const data = controller.value.Data;
			console.log(data);

			let totalValue = controller.value.Data.reduce((total, data) => total + data.Value, 0);
			controller.value.Data.forEach((data) => {
				data.Value = (data.Value / totalValue) * 100;
			});
			// Calculate the start and end angles for each data item
			controller.value.Data.forEach((data, i) => {
				data.StartAngle = (2 * Math.PI * accumulatedValue) / 100;
				data.EndAngle = (2 * Math.PI * (accumulatedValue + data.Value)) / 100;
				accumulatedValue += data.Value;
			});
			controller.value.Data.forEach((data, i) => {
				data.Color = controller.app.colorFromString(data.Label, {
					format: 'cmyk',
					alpha: 0.5,
					luminosity: 'dark'
				});
			});

			controller.value = controller.value;
		}
	});
	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value.Data != null}
	<div class="container">
		<div class="piechart">
			<svg width={size} height={size}>
				{#each controller.value.Data as data (data.Label)}
					<path
						d="M{size / 2},{size / 2} L{size / 2 + (size / 2) * Math.cos(data.StartAngle)} {size /
							2 +
							(size / 2) * Math.sin(data.StartAngle)} A{size / 2},{size / 2} 0 {data.Value > 50
							? 1
							: 0},1 {size / 2 + (size / 2) * Math.cos(data.EndAngle)} {size / 2 +
							(size / 2) * Math.sin(data.EndAngle)} Z"
						fill={data.Color}
					/>
				{/each}
			</svg>
		</div>
		<div class="piechart-legend">
			<ul>
				{#each controller.value.Data as data (data.Label)}
					<ol>
						<span style="background: {data.Color};" />
						{data.Label}: {data.Value}%
					</ol>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style lang="scss">
	.container {
		display: flex;
		justify-content: center;
	}
	.piechart,
	.piechart-legend {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.piechart-legend > ul > ol > span {
		display: inline-block;
		width: 1em;
		height: 1em;
	}
	.piechart-legend > ul > ol > span {
		display: inline-block;
		width: 1em;
		height: 1em;
	}
</style>
