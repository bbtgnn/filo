<script lang="ts" context="module">
	import type { Block } from '$lib/db/schema';
	export type OnSplit = (newBlocks: Block[], oldBlock: Block) => void;
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';
	import { pipe } from 'effect';

	//

	export let block: Block;
	export let onSplit: OnSplit = () => {};

	// TODO - update event when block changes
	const allowOnlyEnter: Action<HTMLDivElement, Block> = (element, block) => {
		element.addEventListener('keydown', function (e) {
			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) return;
			else {
				e.preventDefault();
				console.log(e.key);
				if (e.key == 'Enter') {
					const selection = window.getSelection();
					if (selection) pipe(block.split(selection), (newBlocks) => onSplit(newBlocks, block));
				}
			}
		});
	};
</script>

<div id={block.id.toString()} use:allowOnlyEnter={block} contenteditable="true">
	{block.text}
	<slot />
</div>

<style>
	div {
		padding: 20px;
		border: 1px solid black;
	}
</style>
