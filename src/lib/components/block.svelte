<script lang="ts">
	import { Block } from '$lib/draw/old';

	export let block: Block;
</script>

<div
	id={block.id}
	style:--x="{block.position.x}px"
	style:--y="{block.position.y}px"
	style:--w="{block.width}px"
>
	<span>
		{block.id}
	</span>
	{block.content}
	<pre>{JSON.stringify(block.neighbors, null, 2)}</pre>
	<span>{JSON.stringify(block.abstractPosition, null, 2)}</span>
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
