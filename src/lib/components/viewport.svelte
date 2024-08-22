<script lang="ts">
	import { getFilo } from '$lib/data-model/filo.svelte';
	import { untrack, type Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();

	let filo = getFilo();
	$effect(() => untrack(() => filo.blocks.at(0))?.scrollIntoView());
</script>

<div
	style="width: 100vw; height: 90vh; overflow: scroll; position: relative; background-color: gainsboro;"
>
	{#if children}
		{@render children()}
	{/if}
</div>
