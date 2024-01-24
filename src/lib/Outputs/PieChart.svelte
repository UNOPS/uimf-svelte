<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { onMount } from 'svelte';
	import { spring, tweened } from 'svelte/motion';

	interface IPieChartData {
		Label: string;
		Value: number;
	}

	interface IPieChart {
		Data: IPieChartData[];
	}

	export let size = 200;
	export let percent = 0;
	export const bgColor = 'cornflowerblue';
	export const fgColor = 'orange';

	$: viewBox = `0 0 ${size} ${size}`;
	$: radius = size / 2;
	$: halfCircumference = Math.PI * radius;
	$: pieSize = halfCircumference * (percent / 100);
	$: dashArray = `0 ${halfCircumference - pieSize} ${pieSize}`;

	const store = tweened(0, { duration: 1000 });
	$: store.set(percent);

	export let controller: OutputController<IPieChart>;

	let component = new OutputComponent({
		refresh() {
			//const data = controller.value.Data;

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div>
	<!-- not being displayed -->
	<h2>Check if working</h2>
</div>
<!-- For checking purpose -->
<label>
	Percent
	<input type="number" min="0" max="100" bind:value={percent} />
</label>

<svg width={size} height={size} {viewBox}>
	<circle r={radius} cx={radius} cy={radius} fill={bgColor} />
	<circle
		r={radius / 2}
		cx={radius}
		cy={radius}
		fill={bgColor}
		stroke={fgColor}
		stroke-width={radius}
		stroke-dasharray={dashArray}
	/>
</svg>

<style lang="scss">
	// @import '../scss/styles.variables.scss';
	.div {
		display: flex;
	}
</style>
