<script lang="ts">
	import { Link, type Block, type Sign } from '$lib/db/schema.js';
	import BlockContent, { type OnSplit } from '$lib/components/blockContent.svelte';
	import BlockPosition from '$lib/components/blockPosition.svelte';
	import { Solver } from '$lib/constraints/solver.js';
	import * as kiwi from '@lume/kiwi';
	import { createBlockConstraint, updateBounds, type Dimension } from '$lib/constraints/index.js';
	import type { Action } from 'svelte/action';
	import { uuidv7 } from 'surrealdb.js';
	import { setAppState } from '$lib/state/AppState.svelte.js';
	import { Array, pipe } from 'effect';

	let { data } = $props();

	const appState = setAppState();
	appState.blocks = data.blocks;

	const onSplit: OnSplit = function (newBlocks: Block[], oldBlock: Block) {
		const index = appState.blocks.indexOf(oldBlock);
		appState.blocks.splice(index, 1);
		appState.blocks = [
			...appState.blocks.slice(0, index),
			newBlocks[0],
			...appState.blocks.slice(index)
		];

		appState.blocksQueue = [...appState.blocksQueue, ...newBlocks.slice(1)];
		appState.blockIn = newBlocks.at(0);
		appState.blockOut = appState.blocksQueue.at(0);

		if (!appState.blockIn || !appState.blockOut || !appState.firstBlock) return;

		Solver.suggestBlockCoordinates(
			appState.blockIn,
			oldBlock.coordinates.x.value(),
			oldBlock.coordinates.y.value()
		);
		Solver.instance.updateVariables();

		appState.currentLink = new Link(appState.blockIn, appState.blockOut, 'y', 1);

		Solver.addLink(appState.currentLink);
		Solver.suggestBlockCoordinates(appState.firstBlock, 0, 0);
		// TODO - check if first gets updated after blocks update
		// TODO - fire only if "first" changes
		// TODO - remove old variables since "old first" does not exist anymore
		Solver.instance.updateVariables();
	};

	let redrawKey = $state(uuidv7());

	const handleKeys: Action<Window> = (element) => {
		element.addEventListener('keydown', function (e) {
			if (!appState.blockIn || !appState.blockOut || !appState.currentLink || !appState.currentLink)
				return;
			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) {
				e.preventDefault();
				const linkData: Record<string, { sign: Sign; dimension: Dimension }> = {
					ArrowDown: { dimension: 'y', sign: 1 },
					ArrowUp: { dimension: 'y', sign: -1 },
					ArrowRight: { dimension: 'x', sign: 1 },
					ArrowLeft: { dimension: 'x', sign: -1 }
				};

				const { dimension, sign } = linkData[e.key];
				const newLink = new Link(appState.blockIn, appState.blockOut, dimension, sign);

				Solver.removeLink(appState.currentLink);
				Solver.addLink(newLink);
				appState.currentLink = newLink;

				if (appState.firstBlock) Solver.suggestBlockCoordinates(appState.firstBlock, 0, 0);
				Solver.instance.updateVariables();
				// updateBounds([...blocks, outBlock]);

				redrawKey = uuidv7(); // Crucial
			} else if (e.key == ' ') {
				e.preventDefault();
				appState.blocks.push(appState.blockOut);
				appState.links.push(appState.currentLink);
				appState.blocksQueue.splice(0, 1);
				if (appState.blocksQueue.length === 0) {
					appState.blockIn = undefined;
					appState.blockOut = undefined;
					appState.currentLink = undefined;
					return;
				} else {
					appState.blockIn = appState.blockOut; // TODO - test
					appState.blockOut = appState.blocksQueue[0];
					appState.currentLink = new Link(appState.blockIn, appState.blockOut, 'y', 1);
					Solver.addLink(appState.currentLink);
					if (appState.firstBlock) Solver.suggestBlockCoordinates(appState.firstBlock, 0, 0);
					Solver.instance.updateVariables();
				}
			} else if (['w', 'a', 's', 'd'].includes(e.key)) {
				if (!appState.blockIn) return;
				const positions: Record<string, { x: number; y: number }> = {
					w: { x: 0, y: 1 },
					s: { x: 0, y: -1 },
					a: { x: -1, y: 0 },
					d: { x: 1, y: 0 }
				};
				const nextPosition = positions[e.key];
				const nextBlock = appState.blocks.find(
					(b) =>
						b.position[0] == appState.blockIn!.position[0] + nextPosition.x &&
						b.position[1] == appState.blockIn!.position[1] + nextPosition.y
				);
				if (!nextBlock) return;
				console.log('ok');

				Solver.removeLink(appState.currentLink);
				appState.blockIn = nextBlock;
				const d: Dimension = e.key == 'a' || e.key == 'd' ? 'x' : 'y';
				const s: Sign = e.key == 'a' || e.key == 's' ? -1 : 1;
				appState.currentLink = new Link(appState.blockIn, appState.blockOut, d, s);
				Solver.addLink(appState.currentLink);
				Solver.instance.updateVariables();
			}
		});
	};

	// $inspect(currentConstraint);
</script>

<svelte:window use:handleKeys />

{#key redrawKey}
	<div style="">
		<div
			style="position: relative; width: 100vw; height: 100vh; overflow: auto; background-color: gainsboro;"
		>
			{#each appState.blocks as block (block.id)}
				{#if !appState.blocksQueue.includes(block)}
					{@const isBlockIn = appState.blockIn == block}
					<BlockPosition {block} state={isBlockIn ? 'anchor' : 'idle'}>
						<BlockContent {block} {onSplit} />
					</BlockPosition>
				{/if}
			{/each}

			{#if appState.blockOut}
				<BlockPosition block={appState.blockOut} state="positioning">
					<BlockContent block={appState.blockOut} {onSplit} />
				</BlockPosition>
			{/if}
		</div>

		{#if appState.blocksQueue.length > 0}
			<div id="queue" style="background-color: antiquewhite;">
				{#each appState.blocksQueue as block}
					<div>
						<p>{block.id.toString()}</p>
						<p>{block.text}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/key}
