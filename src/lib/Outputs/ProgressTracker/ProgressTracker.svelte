<script lang="ts" context="module">
	interface Configuration {}

	interface IMetadata extends IOutputFieldMetadata<Configuration> {}

	interface IData {
		Steps: IItem[];
		Current: number | null;
		Open: boolean;
	}

	interface ITask {
		Label: string;
		Completed: boolean | null;
	}

	interface IItem {
		Tooltip: string | null;
		Label: string;
		Tasks: ITask[];
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IOutputFieldMetadata } from '../../Infrastructure/uimf';
	import { tooltip } from '../../Components/Tooltip.svelte';

	export let controller: OutputController<IData, IMetadata>;
	let showSteps = false;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
			showSteps = showSteps || controller.value.Open;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value?.Steps?.length > 0}
	<div class:wrapper={true}>
		{#each controller.value.Steps as step, index}
			<div
				class="step"
				class:current={index === controller.value.Current}
				class:previous={controller.value.Current != null && index < controller.value.Current}
				class:next={controller.value.Current != null && index > controller.value.Current}
			>
				<div class="step-name" use:tooltip={step.Tooltip}>
					{step.Label}
					{#if step.Tasks?.length > 0}
						<small
							role="button"
							tabindex="0"
							on:click={() => (showSteps = !showSteps)}
							on:keydown={(e) => e.key === 'Enter' && (showSteps = !showSteps)}
						>
							{step.Tasks.filter((t) => t.Completed === true).length} / {step.Tasks.length}
						</small>
					{/if}
				</div>
				{#if step.Tasks?.length > 0 && showSteps}
					<ul class="step-tasks">
						{#each step.Tasks as task}
							<li>
								{#if task.Completed === true}
									<span class="fa-regular fa-square-check" />
								{:else if task.Completed === false}
									<span class="fa-regular fa-square" />
								{:else if task.Completed == null}
									<span class="fa-regular fa-square" />
								{/if}
								{task.Label}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			{#if index < controller.value.Steps.length - 1}
				<div
					class="line arrow-line"
					class:next={controller.value.Current != null && index >= controller.value.Current}
				/>
			{/if}
		{/each}
	</div>
{/if}

<style lang="scss">
	.wrapper {
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	.step {
		flex-grow: 0;
		border-radius: 10px;
		background: var(--bg);
		color: var(--color);

		&.current {
			--bg: #bcd9ff;
			--color: var(--bs-black);
			--bg-accent: color-mix(in srgb, var(--bg) 80%, black);
			--border: color-mix(in srgb, var(--bg) 60%, black);
			border: 1px solid var(--border);
		}

		&.previous {
			--bg: #bcd9ff;
			--color: var(--bs-black);
			--bg-accent: color-mix(in srgb, var(--bg) 80%, black);
		}

		&.next {
			--bg: #ebebeb;
			--color: var(--bs-black);
			--bg-accent: color-mix(in srgb, var(--bg) 80%, black);
		}

		& > .step-name {
			font-weight: bold;
			padding: 10px;

			& > small {
				opacity: 0.8;
				cursor: pointer;
				padding: 0 0 0 10px;
				border-left: 1px solid var(--bg-accent);
				margin: 0 0 0 10px;
			}
		}

		& > .step-tasks {
			border-top: 1px solid var(--bg-accent);

			margin: 0px;
			padding: 10px 0;
			list-style-type: none;

			& > li {
				opacity: 0.8;
				padding: 0 10px 0 25px;

				& > span {
					margin: 0 5px 0px -15px;
				}
			}
		}
	}

	.line {
		--line: #273443;

		flex-basis: 30px;
		flex-grow: 1;
		flex-shrink: 1;
		margin: 17px 15px 0px 10px;
		max-width: 100px;

		&.next {
			--line: #b8b8b8;
		}
	}

	.arrow-line {
		height: 1px;
		background-color: var(--line);
		position: relative;
		margin-bottom: 20px;
	}

	.arrow-line::after {
		content: '';
		display: block;
		position: absolute;
		right: -10px;
		top: -5px;
		border-left: 10px solid var(--line);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
	}

	.arrow-line.left-arrow::before {
		content: '';
		display: block;
		position: absolute;
		left: -10px;
		top: -5px;
		border-right: 10px solid var(--line);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
	}
	.arrow-line.left-arrow::after {
		content: none;
	}
</style>
