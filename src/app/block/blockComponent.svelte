<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

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
