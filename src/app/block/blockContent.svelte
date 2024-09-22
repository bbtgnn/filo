<script context="module" lang="ts">
	import { Block, type BlockSplitResult } from './block.svelte';
	export type OnSplit = (splitResult: BlockSplitResult, oldBlock: Block) => void | Promise<void>;
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';
	import { config } from '@/config';
	import { onMount, untrack } from 'svelte';
	import { getFilo } from '@/filo/filo.svelte';

	//

	type Props = {
		block: Block;
		onSplit?: OnSplit;
	};

	let { block, onSplit = () => {} }: Props = $props();

	const filo = getFilo();

	// TODO - Test
	$effect(() => {
		if (block.element) {
			filo.updateBlockSize(
				untrack(() => block),
				{
					// TODO - check if block is not tracked, but block.element yes
					width: block.element.clientWidth,
					height: block.element.clientHeight
				}
			);
		}
	});

	// TODO - update event when block changes
	const splitOnEnter: Action<HTMLDivElement, Block> = (element, block) => {
		element.addEventListener('keydown', function (e) {
			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) return;
			else {
				e.preventDefault();
				if (e.key == 'Enter') {
					const selection = window.getSelection();
					if (!selection) return;
					block.split(selection).match({ Just: (data) => onSplit(data, block), Nothing: () => {} });
				}
			}
		});
	};
</script>

<div
	id={block.id.toString()}
	bind:this={block.element}
	use:splitOnEnter={block}
	contenteditable="true"
	style:--p="{config.block.padding}px"
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

	{#if block.isOrigin}
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
