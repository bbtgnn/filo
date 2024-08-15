<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { Token } from './lib';
	import { pipe, Option as O, String as S, Array as A, Tuple, Order } from 'effect';

	type OnSplit = (tokens: Token[], oldToken: Token) => void;

	export let block: Token;
	export let onSplit: OnSplit = () => {};

	const allowOnlyEnter: Action<HTMLDivElement, Token> = (element, token) => {
		element.addEventListener('keydown', function (e) {
			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) return;
			else {
				e.preventDefault();
				console.log(e.key);
				if (e.key == 'Enter') {
					const selection = window.getSelection();
					const tokens = selectionToTokens(selection, token.id);
					onSplit(tokens, block);
				}
			}
		});
	};

	function selectionToTokens(selection: Selection | null, blockId: string): Token[] {
		if (!selection) return [];
		console.log(selection);
		return pipe(
			selection.anchorNode?.textContent,
			O.fromNullable,
			O.map((textContent) =>
				pipe(
					Tuple.make(selection.anchorOffset, selection.focusOffset),
					(offsets) => Tuple.make(A.min(offsets, Order.number), A.max(offsets, Order.number)),
					([start, end]) => [
						textContent.slice(0, start),
						textContent.slice(start, end),
						textContent.slice(end)
					]
				)
			),
			O.map(A.map(S.trim)),
			O.map(A.filter(Boolean)),
			O.map(A.map((text, index) => ({ text, id: blockId + index.toString() }))),
			O.getOrThrow
		);
	}
</script>

<!-- <pre>{JSON.stringify(data.tokens, null, 2)}</pre> -->

<div use:allowOnlyEnter={block} contenteditable="true">
	{block.text}
</div>
