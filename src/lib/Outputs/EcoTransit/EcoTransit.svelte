<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import greenBadge from './ecotransit_badge_green.png';
	import orangeBadge from './ecotransit_badge_orange.png';

	interface EcoTransitData {
		ShoppingCartItemId: number;
		FreightSelectionType: string;
		FreightForwarderRequestId?: number;
		UnblockedAutomaticRateId?: number;
		SeaRateId?: number;
		InlandRateId?: number;
	}

	interface CachedEmissionsData {
		emissions: string;
		isGreenest: boolean;
	}

	interface EcoTransitEstimateResponse {
		CarbonDioxideEquivalentTotalKg?: number;
		IsGreenest?: boolean;
	}

	export let controller: OutputController<EcoTransitData>;

	function generateCacheKey(data: EcoTransitData): string {
		return (
			`ecotransit-${data.ShoppingCartItemId}-${data.FreightSelectionType}-` +
			`${data.FreightForwarderRequestId ?? 'null'}-` +
			`${data.UnblockedAutomaticRateId ?? 'null'}-` +
			`${data.SeaRateId ?? 'null'}-` +
			`${data.InlandRateId ?? 'null'}`
		);
	}

	function getCachedEmissions(key: string): CachedEmissionsData | null {
		try {
			const cached = sessionStorage.getItem(key);
			if (cached) {
				return JSON.parse(cached);
			}
			return null;
		} catch (e) {
			console.error('Failed to read cached emissions:', e);
			return null;
		}
	}

	function setCachedEmissions(key: string, data: CachedEmissionsData): void {
		try {
			sessionStorage.setItem(key, JSON.stringify(data));
		} catch (e) {
			console.error('Failed to cache emissions:', e);
		}
	}

	let emissions: string | null = null;
	let isGreenest: boolean = false;
	let currentCacheKey: string = '';

	let component = new OutputComponent({
		async init() {
			if (controller.value == null) {
				return;
			}

			if (controller.value.FreightSelectionType === 'NoFreight') {
				return;
			}

			const cacheKey = generateCacheKey(controller.value);
			currentCacheKey = cacheKey;

			const cachedValue = getCachedEmissions(cacheKey);
			if (cachedValue) {
				emissions = cachedValue.emissions;
				isGreenest = cachedValue.isGreenest;
				return;
			}

			try {
				const response = await controller.form!.app.postForm(
					'eco-transit-fetch',
					{
						ShoppingCartItemId: controller.value.ShoppingCartItemId,
						FreightSelectionType: controller.value.FreightSelectionType,
						FreightForwarderRequestId: controller.value.FreightForwarderRequestId,
						UnblockedAutomaticRateId: controller.value.UnblockedAutomaticRateId,
						SeaRateId: controller.value.SeaRateId,
						InlandRateId: controller.value.InlandRateId
					},
					{ skipClientFunctions: true }
				);

				const data = response as EcoTransitEstimateResponse;

				if (data.CarbonDioxideEquivalentTotalKg != null) {
					emissions = Math.round(data.CarbonDioxideEquivalentTotalKg).toString();

					isGreenest = data.IsGreenest === true;

					setCachedEmissions(cacheKey, {
						emissions: emissions,
						isGreenest: isGreenest
					});
				}
			} catch (e) {
				console.error('EcoTransit fetch error:', e);
			}
		},

		refresh() {
			if (controller.value == null) {
				emissions = null;
				isGreenest = false;
				currentCacheKey = '';
				return;
			}

			const newCacheKey = generateCacheKey(controller.value);
			if (newCacheKey !== currentCacheKey) {
				emissions = null;
				isGreenest = false;
				currentCacheKey = newCacheKey;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if emissions}
	<div class="ecotransit-wrapper">
		<div class="ecotransit-badge-container">
			<img
				src={isGreenest ? greenBadge : orangeBadge}
				alt={isGreenest ? 'Greenest option' : 'EcoTransit badge'}
				class="eco-badge"
			/>
			<span class="emission-value-text">
				{emissions}<span class="sup">Kg</span>
			</span>
		</div>
	</div>
{/if}

<style>
	.ecotransit-wrapper {
		display: flex;
		justify-content: flex-end;
		width: 100%;
	}

	.ecotransit-badge-container {
		position: relative;
		display: inline-block;
	}

	.emission-value-text {
		color: #676665;
		font-size: 13px;
		font-weight: bold;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		white-space: nowrap;
	}

	.eco-badge {
		width: 80px;
		display: block;
	}

	.sup {
		position: relative;
		bottom: 1ex;
		font-size: 50%;
	}
</style>
