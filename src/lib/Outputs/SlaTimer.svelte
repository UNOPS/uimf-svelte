<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: OutputController<any>;

	let tooltipContent: string;
	let cssClass: string = '';
	const currentYear = new Date().getFullYear();

	let component = new OutputComponent({
		async refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	var slaTimer = controller.value;
	var datetimeFormat: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	};

	var datetimeAndTimezoneFormat: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'shortOffset'
	};

	var dateFormat: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	};

	function toLocalTimezone(date: Date): Date {
		var localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return new Date(new Date(date).toLocaleString('en-US', { timeZone: localTz }));
	}

	let expiresOn: Date = toLocalTimezone(new Date(slaTimer.ExpiresOn));
	let startedOn: Date = toLocalTimezone(new Date(slaTimer.StartedOn));

	tooltipContent =
		'Duration: ' +
		slaTimer.AllocatedWorkingDays +
		' working days' +
		'<br>Started on: ' +
		startedOn.toLocaleDateString('en-GB', datetimeAndTimezoneFormat) +
		'<br>Expires on: ' +
		expiresOn.toLocaleDateString('en-GB', datetimeAndTimezoneFormat);

	controller.value.expiresOn = toLocalTimezone(expiresOn).toLocaleDateString(
		'en-GB',
		// Use different format for recent vs "long-time-ago" dates.
		slaTimer.Expired && expiresOn.getFullYear() < currentYear ? dateFormat : datetimeFormat
	);

	if (controller.value.Expired) {
		cssClass = 'expired';
	}
</script>

{#if controller.value != null}
	<span class="nowrap {cssClass}" use:tooltip={tooltipContent}>
		{controller.value.expiresOn}
	</span>
{/if}

<style>
	.nowrap {
		white-space: nowrap;
	}

	.expired {
		text-decoration: line-through;
	}
</style>
