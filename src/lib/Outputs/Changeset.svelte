<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { OutputController } from '../Infrastructure/OutputController';

	export let controller: OutputController<any>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class="changeset">
	<div>
		{controller.value.Date} by {controller.value.ChangeBy.Label}

		<div>
			{controller.value.Id}
		</div>
	</div>

	<ul>
		{#each controller.value.Changes as change}
			<li>
				<span>{change.Field}</span>
				<span>{change.OldValue}</span>
				<span>{change.NewValue}</span>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.changeset {
		display: grid;
		border-bottom: 1px solid #eee;
	}

	.changeset > ul > li {
		display: flex;
	}
</style>
