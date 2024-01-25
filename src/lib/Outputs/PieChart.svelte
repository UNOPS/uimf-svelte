<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';

	interface IPieChartData {
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

	export let controller: OutputController<IPieChart>;
	export let items: IPieChartDisplayData[] = [];

	let size = 200; //size for PieChart
	let totalValue = 0;

	let component = new OutputComponent({
		refresh() {
			if (controller.value.Data) {
				items = controller.value.Data;
				let accumulatedValue = 0;
				totalValue = items.reduce((total, item) => total + item.Value, 0);
				items.forEach((item, i) => {
					item.Value = (item.Value / totalValue) * 100;
					item.StartAngle = (2 * Math.PI * accumulatedValue) / 100;
					item.EndAngle = (2 * Math.PI * (accumulatedValue + item.Value)) / 100;
					accumulatedValue += item.Value;
					item.Color = controller.app.colorFromString(item.Label, {
						format: 'cmyk',
						alpha: 1,
						luminosity: 'bright'
					});
				});
			}
			controller.value = controller.value;
		}
	});
	beforeUpdate(async () => await component.setup(controller));
</script>

{#if items != null}
	<div class="container">
		<div class="piechart">
			<svg width={size} height={size}>
				{#each items as item (item.Label)}
					{#if typeof item.StartAngle === 'number' && typeof item.EndAngle === 'number'}
						<path
							d="M{size / 2},{size / 2} L{size / 2 + (size / 2) * Math.cos(item.StartAngle)} {size /
								2 +
								(size / 2) * Math.sin(item.StartAngle)} A{size / 2},{size / 2} 0 {item.Value > 50
								? 1
								: 0},1 {size / 2 + (size / 2) * Math.cos(item.EndAngle)} {size / 2 +
								(size / 2) * Math.sin(item.EndAngle)} Z"
							fill={item.Color}
						/>
					{:else}
						<p>Invalid</p>
					{/if}
				{/each}
			</svg>
		</div>
		<div class="piechart-legend">
			<ul>
				{#each items as item (item.Label)}
					<ol>
						<span style="background: {item.Color};" />
						{item.Label}: {item.Value}%
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
</style>
