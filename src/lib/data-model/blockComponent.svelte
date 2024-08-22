<script lang="ts">
	import type { Block } from '$lib/data-model/block.svelte.ts';
	import BlockPosition from '$lib/components/blockPosition.svelte';
	import BlockState from '$lib/components/blockState.svelte';
	import BlockContent, { type OnSplit } from '$lib/components/blockContent.svelte';

	type Props = {
		block: Block;
		onSplit: OnSplit;
	};

	let { block, onSplit }: Props = $props();
</script>

<BlockPosition {block}>
	<BlockState {block}>
		<BlockContent {block} {onSplit} />
	</BlockState>
</BlockPosition>
