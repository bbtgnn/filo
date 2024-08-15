<script lang="ts">
	import { findConflicts, graphDataToConstraints, solveConflicts } from '$lib/constraints/index.js';
	import Block from '$lib/components/block.svelte';

	export let data;
	const { blocks: blocksWithCoordinates, links: linksWithBlocks } = graphDataToConstraints(
		data.blocks,
		data.links
	);
	const conflicts = findConflicts({
		blocks: Object.values(blocksWithCoordinates),
		links: linksWithBlocks
	});
	solveConflicts(conflicts, 'x');
</script>

<div style="position: relative;">
	{#each blocksWithCoordinates as block}
		<Block {block}>
			{#each conflicts as c}
				{#if c.type == 'block-block' && (c.blockA == block || c.blockB == block)}
					<span style="color: red;">Conflict</span>
				{/if}
			{/each}
		</Block>
	{/each}
</div>
