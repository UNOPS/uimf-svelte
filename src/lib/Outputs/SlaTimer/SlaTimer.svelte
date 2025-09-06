<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { tooltip } from '../../Components/Tooltip.svelte';

	interface Value {
		AllocatedWorkingDays: number;
		Expired: boolean;
		ExpiresOn: Date;
		StartedOn: Date;
	}

	export let controller: OutputController<Value>;

	let tooltipContent: string;
	let expiresOnAsString: string | null;

	const datetimeFormat: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	};

	const datetimeAndTimezoneFormat: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'shortOffset'
	};

	const dateFormat: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	};

	function toLocalTimezone(date: Date): Date {
		var localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return new Date(new Date(date).toLocaleString('en-US', { timeZone: localTz }));
	}

	let component = new OutputComponent({
		async refresh() {
			controller.value = controller.value;

			if (controller.value != null) {
				const expiresOn = toLocalTimezone(new Date(controller.value.ExpiresOn));
				const startedOn = toLocalTimezone(new Date(controller.value.StartedOn));

				tooltipContent =
					`Duration: ${controller.value.AllocatedWorkingDays} working days` +
					`<br>Started on: ${startedOn.toLocaleDateString('en-GB', datetimeAndTimezoneFormat)}` +
					`<br>Expires on: ${expiresOn.toLocaleDateString('en-GB', datetimeAndTimezoneFormat)}`;

				expiresOnAsString = toLocalTimezone(expiresOn).toLocaleDateString(
					'en-GB',
					// Use different format for recent vs "long-time-ago" dates.
					expiresOn.getFullYear() != new Date().getFullYear() ? dateFormat : datetimeFormat
				);
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span class="text-nowrap" class:expired={controller.value.Expired} use:tooltip={tooltipContent}>
		{expiresOnAsString}
	</span>
{/if}

<style>
	.expired {
		text-decoration: line-through;
	}
</style>
