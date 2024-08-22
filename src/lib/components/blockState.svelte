<script lang="ts" context="module">
	export type BlockState = 'idle' | 'positioning' | 'anchor';
</script>

<script lang="ts">
	import type { Block } from '$lib/data-model/block.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();

	let blockState: BlockState = 'idle';

	// let blockState = $derived.by<BlockState>(() => {
	// 	if (filo.blockIn == block) return 'anchor';
	// 	else if (filo.blockOut == block) return 'positioning';
	// 	else return 'idle';
	// });
</script>

<div class="state-idle">
	<!-- <div
	id={block.ids.state}
	class:state-anchor={blockState == 'anchor'}
	class:state-idle={blockState == 'idle'}
	class:state-positioning={blockState == 'positioning'}
> -->
	{@render children()}
</div>

<style>
	.state-hidden {
		display: none;
	}

	.state-idle {
		background-color: white;
	}

	.state-positioning {
		background-color: lightblue;
	}

	.state-anchor {
		background-color: lightgoldenrodyellow;
	}
</style>
