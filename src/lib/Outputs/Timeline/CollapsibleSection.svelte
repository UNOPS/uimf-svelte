<script lang="ts">
	export let headerText: string;
	export let date: string;
	export let status: string;
	export let icon: string;
	export let style: string;

	let expanded = false;
	let currentDate = new Date(date);
	let myDate =
		currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate();
	let myTime = currentDate.getHours() + ':' + currentDate.getMinutes();
	
</script>
<div class="outer-container"> 
<div class="timeline-container">
	<div class="status-date-time-container">
		<div class="status">{status}</div>
		<div class="date-time">{myDate} - {myTime}</div>
	</div>
	<div class="icon-container">
    <div class="icon-bg">
		  <i class={icon} {style} />
    </div>  
    <div class="vertical-line"/>
	</div>

	<div class="collapsible-container">
		<div class="collapsible">
			<button
				aria-expanded={expanded}
				class="speech-bubble {expanded ? 'rounded-bottom' : ''}"
				on:click={() => (expanded = !expanded)}
			>
				<div>{headerText}</div>
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
<style>
.outer-container{
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
		font-size: x-small;
	}

	.date-time {
		color: #cccccc;
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
		border-left: 3px solid #cccccc;
		margin-left: 50%;
    /* transition: height 0.2s ease-in-out; */
    height: 100%;
	}

	.speech-bubble {
		position: relative;
		padding: 10px;
		background-color: #f1f1f1;
		border-radius: 10px;
		color: #000;
		cursor: pointer;
	}

	.speech-bubble::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 100%;
		margin-top: -10px;
		width: 0;
		height: 0;
		border-top: 10px solid transparent;
		border-right: 10px solid #f1f1f1;
		border-bottom: 10px solid transparent;
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
		background: #f1f1f1;
		border: none;
	}

	.fa-circle-check {
		color: var(--check-color, #8ffc74);
	}
</style>
