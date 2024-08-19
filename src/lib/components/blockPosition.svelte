<script lang="ts">
	import { config } from '$lib/config';

	import { Block } from '$lib/db/schema.svelte';
	import type { Snippet } from 'svelte';

	//

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();
</script>

<div
	style:--x="{block.coordinates.x}px"
	style:--y="{block.coordinates.y}px"
	style:--w="{config.block.baseWidth}px"
>
	{@render children()}
</div>

<style>
	div {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--w);
	}
</style>
