<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';

	interface Item {
		Url: string;
		Id: number;
		Name: string;
		Children: Item[];
	}

	interface Items {
		Items: Item[];
	}

	export let controller: OutputController<Items>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	if (controller != undefined) {
		beforeUpdate(async () => await component.setup(controller));
	}

	export let tree = { Id: 0, Name: 'Catalogues', Url: '', Children: controller.value?.Items || {} };

	const { Id, Name, Children, Url } = tree;

	let expanded = true;
	const toggleExpansion = () => {
		expanded = !expanded;
	};
	$: arrowDown = expanded;

	// Function to handle button click and keyboard events
	const handleButtonClick = () => {
		toggleExpansion();
	};

	const handleButtonKeydown = (event: { key: string; preventDefault: () => void; }) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleExpansion();
		}
	};

	const handleLinkKeydown = (event: { key: string; }) => {
		if (event.key === 'Enter') {
			// Allow users to activate the link using Enter key
			window.location.href = Url;
		}
	};
</script>

{#if controller?.value}
	{#if Name == 'Catalogues'}
		<span class="head">{Name}</span>
	{/if}
	<ul>
		<li>
			{#if Children.length > 0}
				{#if Name != 'Catalogues'}
					<span
						on:click={toggleExpansion}
						on:keydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								toggleExpansion();
							}
						}}
						tabindex="0"
						role="button"
						aria-label={`Toggle ${Name} expansion`}
					>
						<span class="arrow" class:arrowDown>&#x25b6;</span>
						<span class="bold">
							<button
								on:click={handleButtonClick}
								on:keydown={handleButtonKeydown}
								aria-label={`Toggle ${Name} expansion`}
							>
								{Name}
							</button>
						</span>
					</span>
				{/if}
				{#if expanded}
					{#each Children as child}
						{#if child != null}
							<svelte:self tree={child} {controller} />
						{/if}
					{/each}
				{/if}
			{:else}
				<span>
					<span class="no-arrow" />
					<button
						on:click={() => (window.location.href = Url)}
						on:keydown={handleLinkKeydown}
						aria-label={`Go to ${Name} ${Id}`}
						tabindex="0"
					>
						{Name} #{Id}
					</button>
				</span>
			{/if}
		</li>
	</ul>
{/if}

<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem;
		user-select: none;
	}
	button {
		border: none;
		background: none;
		cursor: pointer;
		font: inherit;
		padding: 0;
		text-decoration: underline;
		color: #515151;
	}
	.no-arrow {
		padding-left: 1rem;
	}
	.arrow {
		cursor: pointer;
		display: inline-block;
		font-weight: bold;
		transition: transform 200ms;
	}
	.arrowDown {
		transform: rotate(90deg);
	}
	.bold {
		font-weight: bold;
	}
	.head {
		font-weight: 700;
		background-color: #f2f2f2;
		width: 100%;
		padding: 10px 65px;
		margin-bottom: 10px;
		display: block;
	}
</style>
