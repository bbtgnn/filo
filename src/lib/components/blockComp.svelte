<script lang="ts">
	import type { Block } from '$lib/db/schema';
	import BlockPosition from './blockPosition.svelte';
	import BlockState from './blockState.svelte';
	import BlockContent, { type OnSplit } from './blockContent.svelte';

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
