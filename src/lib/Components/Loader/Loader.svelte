<script lang="ts">
	export let visible = false;
	export let progress = 0;

	$: clamped = Math.max(0, Math.min(100, progress));
	$: scale = clamped / 100;
	$: opacity = clamped >= 100 ? 0 : 1;
</script>

{#if visible}
	<div
		class="uimf-progress"
		role="progressbar"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={clamped}
	>
		<div class="uimf-progress__bar" style={`transform: scaleX(${scale}); opacity: ${opacity};`} />
	</div>
{/if}

<style>
	.uimf-progress {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 4px;
		z-index: 9998;
		pointer-events: none;
	}

	.uimf-progress__bar {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-origin: left center;
		background: #fa4848;
		box-shadow: 0 0 8px rgba(35, 44, 101, 0.45);
		transition: transform 0.2s ease, opacity 0.2s ease;
	}
</style>
