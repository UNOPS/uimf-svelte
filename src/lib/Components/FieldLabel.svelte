<script lang="ts">
	import { tooltip } from './Tooltip.svelte';
	import { DocumentationLayout } from '../Infrastructure/Metadata/DocumentationLayout';
	import { FieldLayout } from '../Infrastructure/Metadata/FieldLayout';

	export let label: string;
	export let documentation: string | null;
	export let documentationLayout: DocumentationLayout | null;
	export let fieldLayout: FieldLayout;
</script>

{#if documentationLayout == DocumentationLayout.Icon}
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		class:form-label={true}
		class:label-h={fieldLayout == FieldLayout.Horizontal}
		class:label-v={fieldLayout == FieldLayout.Vertical}>{label}:</label
	>
	<span use:tooltip={documentation}><i class="fa-solid fa-circle-info text-info" /></span>
{:else if documentationLayout == DocumentationLayout.Inline}
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		class:form-label={true}
		class:label-h={fieldLayout == FieldLayout.Horizontal}
		class:label-v={fieldLayout == FieldLayout.Vertical}>{label}:</label
	>
	<div class="alert alert-info field-doc">
		{@html documentation}
	</div>
{:else}
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		class:form-label={true}
		class:label-h={fieldLayout == FieldLayout.Horizontal}
		class:label-v={fieldLayout == FieldLayout.Vertical}
		use:tooltip={documentation}>{label}:</label
	>
{/if}

<style lang="scss">
	@import 'bootstrap/scss/functions';
	@import 'bootstrap/scss/variables';
	@import 'bootstrap/scss/mixins';

	.label-h {
		flex-shrink: 0;
		min-width: 0;
		padding-right: 10px;
		overflow: hidden;
		white-space: normal;

		// Default (mobile first - xs)
		flex-basis: 100px;

		// Bootstrap responsive breakpoints using mixins
		@include media-breakpoint-up(sm) {
			flex-basis: 120px;
		}

		@include media-breakpoint-up(md) {
			flex-basis: 150px;
		}

		@include media-breakpoint-up(lg) {
			flex-basis: 180px;
		}

		@include media-breakpoint-up(xl) {
			flex-basis: 200px;
		}

		@include media-breakpoint-up(xxl) {
			flex-basis: 220px;
		}
	}
</style>
