<script lang="ts" context="module">
	export type BlockState = 'idle' | 'positioning' | 'anchor';
</script>

<script lang="ts">
	import type { Block } from '$lib/db/schema';
	import { getAppState } from '$lib/state/AppState.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();

	let appState = getAppState();

	let blockState = $derived.by<BlockState>(() => {
		if (appState.blockIn == block) return 'anchor';
		else if (appState.blockOut == block) return 'positioning';
		else return 'idle';
	});
</script>

<div
	class:state-anchor={blockState == 'anchor'}
	class:state-idle={blockState == 'idle'}
	class:state-positioning={blockState == 'positioning'}
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
</style>
