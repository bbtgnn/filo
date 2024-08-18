<script lang="ts">
	import type { Block } from '$lib/db/schema.js';
	import BlockContent, { type OnSplit } from '$lib/components/blockContent.svelte';
	import BlockPosition from '$lib/components/blockPosition.svelte';
	import { Solver } from '$lib/constraints/solver.js';
	import * as kiwi from '@lume/kiwi';
	import { createDimensionConstraint, updateBounds } from '$lib/constraints/index.js';
	import type { Action } from 'svelte/action';
	import { uuidv7 } from 'surrealdb.js';

	let { data } = $props();

	let blocks = $state(data.blocks);
	let queue = $state<Block[]>([]);
	let first = $derived(
		blocks
			.filter((block) => [...block.id.id.toString()].every((v) => v == '0'))
			.map((block) => ({ block, depth: block.id.id.toString().length }))[0].block
	);

	$effect(() => {
		Solver.suggestBlockCoordinates(first, 0, 0);
		Solver.instance.updateVariables();
	});

	let inBlock = $state<Block | null>(null);
	let outBlock = $state<Block | null>(null);
	let currentConstraint = $state<kiwi.Constraint | null>(null);

	const onSplit: OnSplit = function (newBlocks: Block[], oldBlock: Block) {
		const index = blocks.indexOf(oldBlock);
		blocks.splice(index, 1);
		blocks = [...blocks.slice(0, index), newBlocks[0], ...blocks.slice(index)];
		queue = [...queue, ...newBlocks.slice(1)];

		inBlock = newBlocks[0];
		outBlock = queue[0];

		const dimension = 'x';

		currentConstraint = new kiwi.Constraint(
			inBlock.coordinates[dimension].plus(-1),
			kiwi.Operator.Ge,
			outBlock.coordinates[dimension],
			kiwi.Strength.required
		);

		Solver.instance.addConstraint(currentConstraint);
		Solver.suggestBlockCoordinates(first, 0, 0);
		Solver.instance.updateVariables();
	};

	let redrawKey = $state(uuidv7());

	const handleKeys: Action<Window> = (element) => {
		element.addEventListener('keydown', function (e) {
			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) {
				if (!inBlock || !outBlock) return;
				if (!currentConstraint) return;

				// TODO - improve
				const constraints: Record<string, kiwi.Constraint> = {
					ArrowDown: createDimensionConstraint(inBlock, outBlock, 'y', 1, kiwi.Strength.weak),
					ArrowUp: createDimensionConstraint(inBlock, outBlock, 'y', -1, kiwi.Strength.weak),
					ArrowRight: createDimensionConstraint(inBlock, outBlock, 'x', 1, kiwi.Strength.weak),
					ArrowLeft: createDimensionConstraint(inBlock, outBlock, 'x', -1, kiwi.Strength.weak)
				};

				const newConstraint = constraints[e.key];
				console.log(newConstraint);
				Solver.instance.removeConstraint(currentConstraint);
				Solver.instance.addConstraint(newConstraint);
				Solver.instance.updateVariables();
				updateBounds([...blocks, outBlock]);

				currentConstraint = newConstraint;

				redrawKey = uuidv7();
			}
		});
	};
</script>

<!-- <svelte:window use:handleKeys /> -->

{#key redrawKey}
	<div style="">
		<div
			style="position: relative; width: 100vw; height: 800px; overflow: auto; background-color: gainsboro;"
		>
			{#each blocks as block (block.id)}
				{#if !queue.includes(block)}
					{@const isBlockIn = inBlock == block}
					<BlockPosition {block} state={isBlockIn ? 'anchor' : 'idle'}>
						<BlockContent {block} {onSplit} />
					</BlockPosition>
				{/if}
			{/each}

			{#if outBlock}
				<BlockPosition block={outBlock} state="positioning">
					<BlockContent block={outBlock} {onSplit} />
				</BlockPosition>
			{/if}
		</div>

		{#if queue.length > 0}
			<div id="queue" style="background-color: antiquewhite;">
				{#each queue as block}
					<div>
						<p>{block.id.toString()}</p>
						<p>{block.text}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/key}
