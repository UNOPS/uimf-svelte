<script lang="ts" context="module">
	interface Money {
		RoeDate: string;
		Amount: number;
		Currency: string;
		Precision: number;
		Components: MoneyComponent[];
	}

	interface MoneyComponent {
		Amount: number;
		Currency: string;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: OutputController<Money>;

	let tooltipContent: string;
	let amountFormatted: string;

	let component = new OutputComponent({
		refresh() {
			if (controller.value == null) {
				return;
			}

			if (controller.value.RoeDate != null) {
				const dateFormat: Intl.DateTimeFormatOptions = {
					day: 'numeric',
					month: '2-digit',
					year: 'numeric'
				};

				const date = new Date(controller.value.RoeDate).toLocaleDateString('en-GB', dateFormat);
				tooltipContent = `Exchange rate date: ${date}<br>`;
			}

			if (controller.value.Components != null) {
				controller.value.Components.forEach((i) => {
					const roe = (controller.value.Amount / i.Amount).toFixed(4);
					tooltipContent += `${i.Amount} ${i.Currency} (${roe}/${controller.value.Currency})<br>`;
				});
			}

			const formatter = new Intl.NumberFormat('en-US', {
				maximumFractionDigits: controller.value.Precision ?? 2
			});

			amountFormatted = formatter.format(controller.value.Amount);
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span use:tooltip={tooltipContent}>
		{amountFormatted}
		<span>{controller.value.Currency}</span>
	</span>
{/if}

<style lang="scss">
	span > span {
		font-size: 0.9em;
		opacity: 0.5;
	}
</style>
