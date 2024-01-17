<script lang="ts">
	import { OutputComponent } from '../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';

	interface IPieChart {
        // TODO: must correspond to the server-side UIMF object that
        // contains the data for the pie chart.
    }

	export let controller: OutputController<IPieChart>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

Pie chart component is not implemented yet.
<!-- TODO: implement html to show the pie chart -->

<style lang="scss">
	@import '../scss/styles.variables.scss';
</style>
