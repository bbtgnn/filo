<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { config } from '@/config';
	import { onMount, untrack } from 'svelte';
	import { FocusState, getFiloManager, IdleState } from '@/states/index.svelte';
	import type { Block } from './block.svelte';
	import { clickOutside } from '$lib/utils';

	//

	type Props = {
		block: Block;
	};

	let { block }: Props = $props();
	const manager = getFiloManager();

	// TODO - Test
	$effect(() => {
		if (block.element) {
			manager.filo.updateBlockSize(
				untrack(() => block),
				{
					// TODO - check if block is not tracked, but block.element yes
					width: block.element.clientWidth,
					height: block.element.clientHeight
				}
			);
		}
	});

	//

	function allowOnlyArrows(e: KeyboardEvent) {
		if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) return;
		else e.preventDefault();
	}

	function handleClick(_: MouseEvent) {
		manager.state('idle')?.focusBlock(block);
	}

	function handleClickOutside() {
		manager.state('focus')?.exit();
	}
</script>

<!-- TODO improve meaningful tabindex -->
<div
	id={block.id.toString()}
	bind:this={block.element}
	use:clickOutside={handleClickOutside}
	onclick={handleClick}
	onkeydown={allowOnlyArrows}
	contenteditable="true"
	style:--p="{config.block.padding}px"
	role="button"
	tabindex="-1"
>
	{block.text}

	<span
		style="position: absolute; left: 0; top: 0; padding: 5px; background-color: red; color: white;"
	>
		{block.id.toString()}
	</span>

	<span
		style="position: absolute; left: 0; bottom: 0; padding: 5px; background-color: green; color: white;"
	>
		{JSON.stringify(block.position)}
	</span>

	{#if manager.filo.origin?.block == block}
		<span
			style="position: absolute; right: 0; top: 0; padding: 5px; background-color: blue; color: white;"
		>
			Origin
		</span>
	{/if}
</div>

<style>
	div {
		position: relative;
		padding: var(--p);
	}
</style>
