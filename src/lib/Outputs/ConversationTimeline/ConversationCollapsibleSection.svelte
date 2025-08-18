<script lang="ts">
	import type { OutputController } from '../../Infrastructure/OutputController';
	import FormLink, { type IFormLinkData } from '../FormLink/FormLink.svelte';
	import type DateTime from '../DateTime/DateTime.svelte';
	import { FormlinkUtilities } from '../FormLink/FormlinkUtilities';

	export let headerText: string;
	export let headerContent: string;
	export let date: string;
	export let isExternal: boolean;
	export let icon: string;
	export let color: string;
	export let isLast: boolean;
	export let action: IFormLinkData | null;
	export let controller: OutputController<Timeline>;

	interface TimelineItem {
		Label: string;
		Date: DateTime;
		Content: string;
		IsExternal: boolean;
		Icon: string;
		Color: string;
		Action: FormLink | null;
	}

	interface Timeline {
		Items: TimelineItem[];
	}

	let expanded = false;
	let currentDate = new Date(date);
	let myDate =
		currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate();
	let myTime = currentDate.getHours() + ':' + currentDate.getMinutes();

	function ellipse(text: string) {
		return text.replace(/<[^>]*>?/gm, '').substring(0, 30) + '...';
	}
</script>

<div class="outer-container">
	<div class="timeline-container">
		<div class="status-date-time-container">
			<div class="status">Sent on</div>
			<div class="date-time">{myDate} - {myTime}</div>
		</div>
		<div class="icon-container">
			<div class="icon-bg" style:color>
				<i class={icon} />
			</div>

			<div class={isLast ? 'vertical-line-last' : 'vertical-line'} />
		</div>

		<div class="collapsible-container">
			<div class="collapsible">
				<button
					aria-expanded={expanded}
					class="speech-bubble {expanded ? 'rounded-bottom' : ''}"
					style:background-color={color}
					style="--before-color: {color}"
					on:click={() => (expanded = !expanded)}
				>
					<div class="header-container">
						{#if isExternal && action != null}
							<FormLink
								controller={FormlinkUtilities.createFormlink({ data: action, parent: controller })}
							/>
						{/if}

						<div class="header-text">{headerText}</div>

						{#if !expanded}
							<div class="shorten-text">{@html ellipse(headerContent)}</div>
						{/if}
					</div>

					{#if expanded}
						<i class="fa-solid fa-caret-down" />
					{:else}
						<i class="fa-solid fa-caret-left" />
					{/if}
				</button>
				<div hidden={!expanded}>
					<slot />
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	$primary-color: #cccccc;
	$secondary-color: #f3f3f3;
	$tertiary-color: #cccccc;

	:global(.as-link) {
		background: transparent;
		border: none;
		color: white;
		padding: 0px;
	}

	.header-container {
		display: flex;
		flex-direction: row;
		align-items: baseline;
	}

	.header-text {
		font-size: medium;
		padding-left: 10px;
	}

	.shorten-text {
		font-style: italic;
		color: $secondary-color;
		padding: 0px 0px 0px 15px;
		font-size: larger;
	}

	.outer-container {
		display: flex;
	}

	.timeline-container {
		display: flex;
		gap: 20px;
		align-items: flex-start;
		flex-grow: 1;
	}

	.status-date-time-container {
		display: flex;
		flex-direction: column;
		font-size: 9px;
		width: 12%;
		margin-top: 5px;
	}

	.status {
		color: $tertiary-color;
	}

	.date-time {
		font-size: small;
	}

	.icon-container {
		margin-top: 9px;
		align-items: center;
		height: 100%;
	}

	.collapsible-container {
		flex: 1;
		margin-bottom: 5px;
	}

	.icon-bg {
		background-color: white;
	}

	.vertical-line {
		border-left: 3px solid $primary-color;
		margin-left: 50%;
		height: 100%;
	}

	.vertical-line-last {
		border-left: 3px dashed $primary-color;
		margin-left: 50%;
		height: 50%;
	}

	.speech-bubble {
		position: relative;
		padding: 10px;
		border-radius: 10px;
		color: white;
		cursor: pointer;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			right: 100%;
			margin-top: -10px;
			width: 0;
			height: 0;
			border-top: 10px solid transparent;
			border-right: 10px solid var(--before-color);
			border-bottom: 10px solid transparent;
		}
	}

	.rounded-bottom {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.collapsible-container button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: $primary-color;
		border: none;
	}
</style>
