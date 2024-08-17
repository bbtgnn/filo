<script lang="ts">
	import type { Block } from '$lib/db/schema.js';
	import BlockContent, { type OnSplit } from '$lib/components/blockContent.svelte';

	export let data;

	let blocks = data.blocks;

	const onSplit: OnSplit = function (newBlocks: Block[], oldBlock: Block) {
		const index = blocks.indexOf(oldBlock);
		blocks.splice(index, 1);
		blocks = [...blocks.slice(0, index), ...newBlocks, ...blocks.slice(index)];
	};
</script>

{#each blocks as block (block.id)}
	<BlockContent {block} {onSplit} />
{/each}
