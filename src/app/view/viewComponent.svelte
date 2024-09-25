<script lang="ts">
	import { getFilo } from '@/filo/filo.svelte';
	import { untrack, type Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();

	let filo = getFilo();
	$effect(() => untrack(() => filo.blocks.at(0))?.scrollIntoView());
	$effect(() => filo.blockIn?.scrollIntoView());
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
