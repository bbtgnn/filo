<script context="module" lang="ts">
	import { Block, type BlockSplitResult } from '$lib/data-model/block.svelte';
	export type OnSplit = (splitResult: BlockSplitResult, oldBlock: Block) => void | Promise<void>;
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';
	import { config } from '$lib/config';
	import { untrack } from 'svelte';

	//

	type Props = {
		block: Block;
		onSplit?: OnSplit;
	};

	let { block, onSplit = () => {} }: Props = $props();
	// TODO - Test
	$effect(() => {
		if (block.element) {
			untrack(() => block).updateSize({
				// TODO - check if block is not tracked, but block.element yes
				width: block.element.clientWidth,
				height: block.element.clientHeight
			});
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
</div>

<style>
	div {
		padding: var(--p);
	}
</style>
