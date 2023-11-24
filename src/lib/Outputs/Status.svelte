<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';

	interface StatusData {
		Label: string;
		Tooltip: string | null;
		Icon: string | null;
		CssClass: string | null;
	}

	export let controller: OutputController<StatusData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span use:tooltip={controller.value.Tooltip} class={controller.value.CssClass}>
		{#if controller.value.Icon != null}
			<i class={controller.value.Icon} />
		{/if}
		{#if controller.value.Label != null}
			{controller.value.Label}
		{/if}
	</span>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	i {
		padding-left: 0;
		margin-left: 0;
		margin-right: 5px;
		min-width: 15px;
		text-align: center;
	}

	$status-categories: (
		'success': $success,
		'failure': $danger,
		'ongoing': #a3ceff,
		'completed': $light,
		'pending': $warning
	);

	@each $category, $color in $status-categories {
		.#{$category} > i {
			color: $color;
		}
	}

	:global(.badge) {
		& > i {
			margin-right: 0;
			margin-left: -4px;
		}

		@each $category, $bg in $status-categories {
			$color: color-contrast($bg);

			&.#{$category} {
				& > i {
					color: $color;
				}

				color: $color;
				background-color: $bg;
			}
		}
	}
</style>
