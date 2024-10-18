<script lang="ts">
	import { beforeUpdate } from 'svelte';
    import Output from '../Output.svelte';
    import FormLink from './FormLink.svelte';

    import { OutputController } from '../Infrastructure/OutputController';
    import { OutputComponent } from '../Infrastructure/Component';
    import type { IFieldMetadata } from '$lib/Infrastructure/uimf';
    import type { Controller as FormLinkController, FormLinkData } from './FormLink.svelte';


	interface Configuration {
		CssClass: string;
		CssClassEach: string;
		Properties: IFieldMetadata[];
	}

	class Controller extends OutputController<any, IFieldMetadata<Configuration>> {}

	export let controller: Controller;

	let fields: OutputController<any>[] = [];

	let component = new OutputComponent({
		refresh() {
			fields = controller.metadata.Component.Configuration.Properties.filter((t) => !t.Hidden)
				.sort((a, b) => a.OrderIndex - b.OrderIndex)
				.map((property) => {
					return new OutputController<any>({
						metadata: property,
						data: controller.value == null ? null : controller.value[property.Id],
						form: controller.form,
						app: controller.app,
						parent: controller
					});
				});
		}
	});

	const makeFormLinkController = (formlink: FormLinkData) => {
		return new OutputController<FormLinkData>({
			metadata: {} as IFieldMetadata,
			data: formlink,
			form: controller.form,
			app: controller.app,
			parent: controller
		}) as FormLinkController;
	};

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<div class={controller.metadata.Component.Configuration?.CssClass}>
		<div class="panel-section">
			<div class="panel-header">
				
				<div class="panel-label">{controller.value.Label}</div>

				{#if controller.value.Actions?.length > 0}
					{#each controller.value.Actions as action}
						<FormLink controller={makeFormLinkController(action)} />
					{/each}
				{/if}

			</div>
			{#each fields as field}
				<div class={controller.metadata.Component.Configuration?.CssClassEach}>
					<Output controller={field} />
				</div>
			{/each}
		</div>
	</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';
	.panel-section {
		border-color: $app-soft-bg;
		border-style: solid;
		border-width: 0 0 10px;
		padding: 10px
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: $app-soft-bg;
		padding: 5px 10px;
		margin-bottom: 15px;
	}

	.panel-label {
		font-size: 1.2em;
	}
</style>
