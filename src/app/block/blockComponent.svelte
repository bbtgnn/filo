<script lang="ts">
	import type { Block } from './block.svelte';
	import BlockPosition from './blockPosition.svelte';
	import BlockState from './blockState.svelte';
	import BlockContent from './blockContent.svelte';

	type Props = {
		block: Block;
	};

	let { block }: Props = $props();
</script>

<BlockPosition {block}>
	<BlockState {block}>
		<BlockContent {block} />
	</BlockState>
</BlockPosition>
