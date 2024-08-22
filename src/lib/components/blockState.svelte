<script lang="ts">
	import type { Block } from '$lib/data-model/block.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();
</script>

<div
	class:state-anchor={block.status == 'in'}
	class:state-idle={block.status == 'idle'}
	class:state-positioning={block.status == 'out'}
	class:state-queue={block.status == 'queue'}
>
	{@render children()}
</div>

<style>
	.state-idle {
		background-color: white;
	}

	.state-positioning {
		background-color: lightblue;
	}

	.state-anchor {
		background-color: lightgoldenrodyellow;
	}

	.state-queue {
		background-color: ghostwhite;
	}
</style>
