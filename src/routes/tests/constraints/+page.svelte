<script lang="ts">
	import { findConflicts, graphDataToConstraints, solveConflicts } from '$lib/constraints/index.js';
	import BlockPosition from '$lib/components/blockPosition.svelte';

	export let data;
	let { blocks, links } = data;
	graphDataToConstraints(blocks, links);
	const conflicts = findConflicts({
		blocks,
		links
	});
	solveConflicts(conflicts, 'x');
</script>

<div style="position: relative;">
	{#each blocks as block}
		<BlockPosition {block}>
			<div style="border: 1px solid black;">
				{block.text}
				{#each conflicts as c}
					{#if c.type == 'block-block' && (c.blockA == block || c.blockB == block)}
						<span style="color: red;">Conflict</span>
					{/if}
				{/each}
			</div>
		</BlockPosition>
	{/each}
</div>
