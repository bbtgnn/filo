<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { getFiloManager } from '@/manager';
	import type { Block } from './block.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		block: Block;
		children: Snippet;
	};

	let { block, children }: Props = $props();

	const manager = getFiloManager();
	const state = $derived(manager.getBlockState(block));
</script>

<div
	class:state-anchor={state == 'in'}
	class:state-idle={state == 'idle'}
	class:state-positioning={state == 'out'}
	class:state-queue={state == 'queue'}
	class:state-focus={state == 'focus'}
>
	{@render children()}
</div>

<style>
	.state-idle {
		background-color: white;
	}

	.state-positioning {
		background-color: lightblue;
	}

	.state-anchor {
		background-color: lightgoldenrodyellow;
	}

	.state-queue {
		background-color: ghostwhite;
		opacity: 50%;
	}

	.state-focus {
		background-color: white;
		outline: 5px solid red;
	}
</style>
