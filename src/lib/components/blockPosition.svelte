<script lang="ts" context="module">
	export type BlockState = 'idle' | 'positioning' | 'anchor';
</script>

<script lang="ts">
	import { config } from '$lib/config';

	import { Block } from '$lib/db/schema';
	import type { Snippet } from 'svelte';

	//

	type Props = {
		block: Block;
		children: Snippet;
		state: BlockState;
	};

	let { block, children, state }: Props = $props();
</script>

<div
	style:--x="{block.coordinates.x}px"
	style:--y="{block.coordinates.y}px"
	style:--w="{config.block.baseWidth}px"
	style:--h="{config.block.baseHeight}px"
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
