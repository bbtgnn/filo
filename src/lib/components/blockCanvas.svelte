<script lang="ts">
	import { config } from '$lib/config';
	import type { Snippet } from 'svelte';

	//

	let { children }: { children: Snippet } = $props();
	let el = $state<HTMLElement>();

	$effect(() => {
		el?.children.item(0)?.scrollIntoView({ block: 'center', inline: 'center' });
	});

	//

	const { width, height } = config.viewport;
</script>

<div bind:this={el} style:--w="{width}px" style:--h="{height}px">
	{@render children()}
</div>

<style>
	div {
		width: var(--w);
		height: var(--h);
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
