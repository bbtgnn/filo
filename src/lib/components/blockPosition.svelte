<script lang="ts">
	import { config } from '$lib/config';

	import { Block } from '$lib/data-model/block.svelte';
	import type { Snippet } from 'svelte';

	//

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();
</script>

<div
	style:--x="{block.position.x}px"
	style:--y="{block.position.y}px"
	style:--max-width="{config.block.baseWidth}px"
>
	{@render children()}
</div>

<style>
	div {
		position: absolute;
		left: var(--x);
		top: var(--y);
		max-width: var(--max-width);
	}
</style>
