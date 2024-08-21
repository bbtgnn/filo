<script lang="ts">
	import { config } from '$lib/config';
	import { getFilo } from '$lib/data-model/filo.svelte';
	import type { Snippet } from 'svelte';

	//

	let { children }: { children?: Snippet } = $props();
	const filo = getFilo();

	const { width, height } = config.viewport;
</script>

<div id={filo.ids.blockCanvas} style:--w="{width}px" style:--h="{height}px">
	{#if children}
		{@render children()}
	{/if}
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
