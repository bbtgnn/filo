<script lang="ts" context="module">
	import { config } from '$lib/config';
	import { Solver } from '$lib/constraints/solver';
	import { Link, type Block, type BlockSplitResult } from '$lib/db/schema.svelte';
	import { getAppState } from '$lib/state/AppState.svelte';
	export type OnSplit = (splitResult: BlockSplitResult, oldBlock: Block) => void;
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';

	//

	export let block: Block;

	const appState = getAppState();

	const onSplit: OnSplit = function (data, oldBlock) {
		appState.blocks.splice(appState.blocks.indexOf(oldBlock), 1);
		appState.blocks.push(data.in);
		appState.blocksQueue = data.queue;
		appState.blockIn = data.in;
		appState.blockOut = data.out;

		if (!appState.blockIn || !appState.blockOut) return;

		Solver.suggestBlockCoordinates(
			appState.blockIn,
			oldBlock.variables.x.value(),
			oldBlock.variables.y.value()
		);
		Solver.instance.updateVariables();

		appState.currentLink = new Link(appState.blockIn, appState.blockOut, 'y', 1);

		Solver.addLink(appState.currentLink);
		Solver.instance.updateVariables();
	};

	// TODO - update event when block changes
	const allowOnlyEnter: Action<HTMLDivElement, Block> = (element, block) => {
		element.addEventListener('keydown', function (e) {
			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) return;
			else {
				e.preventDefault();
				if (e.key == 'Enter') {
					const selection = window.getSelection();
					if (!selection) return;
					block.split(selection).match({ Just: (data) => onSplit(data, block), Nothing: () => {} });
				}
			}
		});
	};
</script>

<div
	id={block.id.toString()}
	bind:this={block.element}
	use:allowOnlyEnter={block}
	contenteditable="true"
	style:--p="{config.block.padding}px"
>
	{block.text}
	<slot />
</div>

<style>
	div {
		padding: var(--p);
	}
</style>
