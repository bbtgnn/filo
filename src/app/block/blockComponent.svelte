<script lang="ts">
	import type { Block } from './block.svelte';
	import BlockPosition from './blockPosition.svelte';
	import BlockState from './blockState.svelte';
	import BlockContent from './blockContent.svelte';
	import type { OnSplit } from './blockContent.svelte';

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
