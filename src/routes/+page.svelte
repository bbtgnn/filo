<script lang="ts">
	import { graphDataToConstraints } from '$lib/constraints/index.js';
	import Block from '$lib/components/block.svelte';

	export let data;
	let { blocks, dimensions, links } = data;
	const { blocksWithCoordinates } = graphDataToConstraints(blocks, links, dimensions);
</script>

<div style="position: relative;">
	{#each Object.values(blocksWithCoordinates) as block}
		<Block {block} />
	{/each}
</div>
