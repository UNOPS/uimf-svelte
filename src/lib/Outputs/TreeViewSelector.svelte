<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	interface Item {
		Url: string;
		Id: number;
		Name: string;
		Children: Item[];
		CssClass: string;
	}

	export let controller: OutputController<Item>;
	export let depth: number = 0;

	let expanded = depth === 0;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function buildController(value: Item) {
		return new OutputController<Item>({
			app: controller.app,
			data: value,
			form: controller.form,
			metadata: controller.metadata,
			parent: controller
		});
	}
</script>

{#if controller.value != null}
	<ul>
		<li class={controller.value.CssClass}>
			{#if controller.value.Name?.length > 0}
				{#if controller.value.Children.length > 0}
					<span
						on:click={() => (expanded = !expanded)}
						on:keydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								expanded = !expanded;
							}
						}}
						tabindex="0"
						role="button"
						aria-label={`Toggle ${controller.value.Name} expansion`}
						class="arrow"
						class:down={expanded}
					>
						&#x25b6;
					</span>
				{/if}
				<a href={controller.value.Url}>{controller.value.Name}</a>
			{/if}

			{#if expanded && controller.value.Children?.length > 0}
				{#each controller.value.Children as child}
					<svelte:self controller={buildController(child)} depth={depth + 1} />
				{/each}
			{/if}
		</li>
	</ul>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	ul {
		margin: 0;
		list-style: none;
		padding-left: 14px;
		user-select: none;

		& > li {
			margin-bottom: 0;

			& > a {
				text-decoration: none;
			}

			&.active > a {
				font-weight: bold;
				text-decoration: underline;
			}
		}
	}

	.arrow {
		margin-left: -14px;
		cursor: pointer;
		display: inline-block;
		transition: transform 200ms;
		color: $primary;
		opacity: 0.6;

		&.down {
			transform: rotate(90deg);
		}
	}
</style>
