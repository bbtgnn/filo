<script lang="ts">
	import { Block } from '$lib/db/schema';
	import { pipe, Record as R, Option as O, Array as A } from 'effect';

	//

	export let block: Block;

	//

	const spaceX = 200;
	const spaceY = 200;
	const width = 100;

	$: x = getCoordinate(block, 'x') * spaceX;
	$: y = getCoordinate(block, 'y') * spaceY;

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

<div style:--x="{x}px" style:--y="{y}px" style:--w="{width}px">
	<slot />
</div>

<style>
	div {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--w);
	}
</style>
