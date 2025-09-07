<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { FieldLayout, IComponent, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';
	import Output from '../../Output.svelte';

	interface RecursiveData {
		Items: RecursiveData[];
		Level: number | null;
	}

	interface IConfiguration {
		Component: IComponent;
	}

	export let controller: OutputController<RecursiveData, IOutputFieldMetadata<IConfiguration>>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getContentController(item: RecursiveData) {
		const metadata = OutputFieldMetadataFactory.fromComponent(
			controller.metadata.Component.Configuration.Component
		);

		metadata.Layout = FieldLayout.None;

		return controlRegister.createOutput({
			props: {
				app: controller.app,
				form: controller.form,
				data: item,
				parent: controller,
				metadata: metadata
			}
		}).controller;
	}

	function createChildController(child: RecursiveData, level: number) {
		const metadata = OutputFieldMetadataFactory.fromComponent(controller.metadata.Component);

		metadata.Layout = FieldLayout.None;

		return controlRegister.createOutput({
			props: {
				app: controller.app,
				form: controller.form,
				data: {
					Items: [child],
					Level: level
				},
				parent: controller,
				metadata: metadata
			}
		}).controller;
	}
</script>

{#if controller.value?.Items != null}
	{#each controller.value.Items as item}
		{@const content = getContentController(item)}
		{@const level = controller.value.Level ?? 1}
		<div class="item" class:even={level % 2 === 0} class:root={level == 1}>
			<div class="item-content">
				<Output controller={content} />
			</div>

			{#if item.Items != null}
				{#each item.Items as child, index}
					{@const childController = createChildController(child, level + 1)}
					<div class="child">
						<svelte:self controller={childController} />
					</div>
					{#if index < item.Items.length - 1}
						<div class="separator" />
					{/if}
				{/each}
			{/if}
		</div>
	{/each}
{/if}

<style lang="scss">
	.item {
		border-left: 1px solid gray;

		&.even {
			border: none;
			background: #afcde740;
		}

		&.root {
			margin: 20px 0 20px 0;
		}
	}

	.item-content {
		padding: 10px 20px 10px 20px;
	}

	.child {
		margin: 10px 20px;

		&:last-child {
			padding-bottom: 20px;
		}
	}

	.root > .separator {
		display: none;
	}

	.separator {
		height: 15px;
	}
</style>
