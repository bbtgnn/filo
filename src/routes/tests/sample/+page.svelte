<script lang="ts">
	import { Link, type Block, type Position, type Sign } from '$lib/db/schema.js';
	import BlockContent, { type OnSplit } from '$lib/components/blockContent.svelte';
	import BlockPosition from '$lib/components/blockPosition.svelte';
	import { Solver } from '$lib/constraints/solver.js';
	import { type Dimension } from '$lib/constraints/index.js';
	import { uuidv7 } from 'surrealdb.js';
	import { setAppState } from '$lib/state/AppState.svelte.js';
	import { shortcut, type ShortcutEventDetail, type ShortcutTrigger } from '@svelte-put/shortcut';

	let { data } = $props();

	const appState = setAppState();
	appState.blocks = data.blocks;

	Solver.getBlockPositionConstraints(appState.blocks[0], 0, 0).forEach((constraint) =>
		Solver.instance.addConstraint(constraint)
	);
	Solver.instance.updateVariables();

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

	let redrawKey = $state(uuidv7());
	function redraw() {
		redrawKey = uuidv7();
	}

	//

	type ShortcutCallback = (detail: ShortcutEventDetail) => void;

	const moveBlockOut: ShortcutCallback = (detail) => {
		if (!appState.blockIn || !appState.blockOut || !appState.currentLink) return;
		const e = detail.originalEvent;
		e.preventDefault();

		const linkData: Record<string, { sign: Sign; dimension: Dimension }> = {
			ArrowDown: { dimension: 'y', sign: 1 },
			ArrowUp: { dimension: 'y', sign: -1 },
			ArrowRight: { dimension: 'x', sign: 1 },
			ArrowLeft: { dimension: 'x', sign: -1 }
		};

		const { dimension, sign } = linkData[detail.originalEvent.key];
		const newLink = new Link(appState.blockIn, appState.blockOut, dimension, sign);

		Solver.removeLink(appState.currentLink);
		Solver.addLink(newLink);
		appState.currentLink = newLink;
		Solver.instance.updateVariables();

		redraw();
	};

	const confirmBlockOut: ShortcutCallback = (detail) => {
		if (!appState.blockIn || !appState.blockOut || !appState.currentLink) return;
		const e = detail.originalEvent;
		e.preventDefault();

		appState.blocks.push(appState.blockOut);
		appState.links.push(appState.currentLink);
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
			Solver.instance.updateVariables();
			appState.blocksQueue.splice(0, 1);
		}
	};

	const moveBlockIn: ShortcutCallback = (detail) => {
		if (!appState.blockIn || !appState.blockOut || !appState.currentLink) return;
		const e = detail.originalEvent;
		e.preventDefault();

		const positions: Record<string, Position> = {
			w: { x: 0, y: -1 },
			s: { x: 0, y: 1 },
			a: { x: -1, y: 0 },
			d: { x: 1, y: 0 }
		};
		const nextPosition = positions[e.key];
		const nextBlock = appState.blocks.find(
			(b) =>
				b.position.x == appState.blockIn!.position.x + nextPosition.x &&
				b.position.y == appState.blockIn!.position.y + nextPosition.y
		);
		if (!nextBlock) return;

		Solver.removeLink(appState.currentLink);
		appState.blockIn = nextBlock;
		const d: Dimension = e.key == 'a' || e.key == 'd' ? 'x' : 'y';
		const s: Sign = e.key == 'a' || e.key == 'w' ? -1 : 1;
		appState.currentLink = new Link(appState.blockIn, appState.blockOut, d, s);
		Solver.addLink(appState.currentLink);
		Solver.instance.updateVariables();

		redraw();
	};

	const commands: ShortcutTrigger[] = [
		...['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].map((key) => ({
			key,
			callback: moveBlockOut
		})),
		...['w', 'a', 's', 'd'].map((key) => ({ key, callback: moveBlockIn })),
		{
			key: ' ',
			callback: confirmBlockOut
		}
	];
</script>

<svelte:window use:shortcut={{ trigger: commands }} />

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
