<script lang="ts" context="module">
	export type BlockState = 'idle' | 'positioning' | 'anchor';
</script>

<script lang="ts">
	import { Block } from '$lib/db/schema';
	import { pipe, Record as R, Option as O, Array as A } from 'effect';
	import type { Snippet } from 'svelte';

	//

	type Props = {
		block: Block;
		children: Snippet;
		state: BlockState;
	};

	let { block, children, state }: Props = $props();

	//

	const offset = 400;
	const width = 400;
	const height = 300;
	const spaceX = width + 100;
	const spaceY = height + 100;

	let x = $derived(getCoordinate(block, 'x') * spaceX + offset);
	let y = $derived(getCoordinate(block, 'y') * spaceY + offset);

	function getCoordinate(block: Block, axis: 'x' | 'y') {
		return pipe(
			block.coordinates,
			R.toEntries,
			A.findFirst(([dimensionId]) => dimensionId.includes(axis)),
			O.map(([, coordinate]) => coordinate.value()),
			O.getOrThrow
		);
	}
</script>

<div
	style:--x="{x}px"
	style:--y="{y}px"
	style:--w="{width}px"
	style:--h="{height}px"
	class:state-positioning={state == 'positioning'}
	class:state-anchor={state == 'anchor'}
>
	{@render children()}
</div>

<style>
	div {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--w);
		height: var(--h);
		overflow: auto;
	}

	.state-positioning {
		background-color: lightblue;
	}

	.state-anchor {
		background-color: lightgoldenrodyellow;
	}
</style>
