<script lang="ts">
	import { getFiloManager, PositioningState } from '@/states/index.svelte';
	import { untrack, type Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};

	const { children }: Props = $props();

	const manager = getFiloManager();
	const filo = manager.filo;

	$effect(() => untrack(() => filo.blocks.at(0))?.scrollIntoView());
	$effect(() => {
		manager.state('positioning')?.context.blocks.in.scrollIntoView();
	});
</script>

<div
	style="width: 100vw; height: 90vh; overflow: scroll; position: relative; background-color: gainsboro;"
>
	{#key filo.view.redrawKey}
		{#if children}
			{@render children()}
		{/if}
	{/key}
</div>
