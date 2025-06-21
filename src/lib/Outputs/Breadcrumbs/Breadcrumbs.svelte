<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { OutputController } from '../../Infrastructure/OutputController';
	import FormLink, { type IFormLinkData } from '../FormLink/FormLink.svelte';
	import { FormlinkUtilities } from '../FormLink/FormlinkUtilities';

	interface BreadcrumbsData {
		Path: IFormLinkData[];
	}

	export let controller: OutputController<BreadcrumbsData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value?.Path?.length > 0}
	<nav>
		<ol class="breadcrumb">
			{#each controller.value.Path as link}
				<li class="breadcrumb-item active">
					<FormLink
						controller={FormlinkUtilities.createFormlink({ data: link, parent: controller })}
					/>
				</li>
			{/each}
		</ol>
	</nav>
{/if}
