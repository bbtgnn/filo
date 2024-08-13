<script lang="ts">
	import type { BlockWithCoords } from '$lib/db/schema';
	import { pipe, Array as A, Record as R, Option as O } from 'effect';

	const spaceX = 200;
	const spaceY = 200;
	const width = 100;

	export let block: BlockWithCoords;
	$: x = getCoordinate(block, 'x') * spaceX;
	$: y = getCoordinate(block, 'y') * spaceY;

	function getCoordinate(block: BlockWithCoords, axis: 'x' | 'y') {
		return pipe(
			block.coordinates,
			R.toEntries,
			A.findFirst(([dimensionId]) => dimensionId.includes(axis)),
			O.map(([, coordinate]) => coordinate.value()),
			O.getOrThrow
		);
	}
</script>

<div id={block.id.toString()} style:--x="{x}px" style:--y="{y}px" style:--w="{width}px">
	<span>
		{block.id}
	</span>
	{block.text}
</div>

<style>
	div {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--w);
		background-color: beige;
		border: 1px solid brown;
		border-radius: 10px;
		padding: 10px;
	}
	span {
		font-weight: bold;
	}
</style>
