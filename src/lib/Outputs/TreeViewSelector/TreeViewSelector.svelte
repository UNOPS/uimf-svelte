<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { IFormlinkBase } from '../FormLink/IFormlinkBase';

	interface Item {
		Url: IFormlinkBase;
		Id: number;
		Name: string;
		Children: Item[];
		CssClass: string;
		IsExpanded: boolean;
	}

	export let controller: OutputController<Item>;

	let expanded = controller.value.IsExpanded;

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
				{@const url = controller.app.buildFormUrl(
					controller.value.Url.Form ?? '',
					controller.value.Url.InputFieldValues
				)}
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
				{:else}
					<i class="fa-solid fa-minus minus" />
				{/if}

				<a href={url}>{@html controller.value.Name}</a>
			{/if}

			{#if expanded && controller.value.Children?.length > 0}
				{#each controller.value.Children as child}
					<svelte:self controller={buildController(child)} />
				{/each}
			{/if}
		</li>
	</ul>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	ul {
		font-size: 1em;
		margin: 0;
		list-style: none;
		padding-left: 5px;
		user-select: none;

		& > li {
			font-size: 1em;
			margin-bottom: 0;
			margin-left: 5px;

			& > a {
				text-decoration: none;
			}

			&.active > a {
				font-weight: bold;
			}
		}
	}

	.arrow {
		margin-top: 5px;
		margin-left: -20px;
		margin-right: 3px;
		cursor: pointer;
		display: inline-block;
		transition: transform 0.2s;
		color: $primary;
		opacity: 0.6;

		&.down {
			transform: rotate(90deg);
		}
	}
	.minus {
		margin-left: -20px;
		margin-right: 3px;
		cursor: pointer;
		display: inline-block;
		transition: transform 0.2s;
		color: #579ddb;
		opacity: 0.6;
	}
</style>
