<script lang="ts" context="module">
	import { Block, type BlockSplitResult } from '$lib/data-model/block.svelte';
	export type OnSplit = (splitResult: BlockSplitResult, oldBlock: Block) => void;
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';
	import { config } from '$lib/config';

	//

	type Props = {
		block: Block;
		onSplit?: OnSplit;
	};

	let { block, onSplit = () => {} }: Props = $props();

	// TODO - update event when block changes
	const allowOnlyEnter: Action<HTMLDivElement, Block> = (element, block) => {
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
	id={block.ids.content}
	use:allowOnlyEnter={block}
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
