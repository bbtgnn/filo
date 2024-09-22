<script lang="ts">
	import type { Snippet } from 'svelte';

	import { config } from '@/config';
	import { Block } from './block.svelte';

	//

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();
</script>

<div
	style:--x="{block.absolutePosition.x}px"
	style:--y="{block.absolutePosition.y}px"
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
