<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { shortcut, type ShortcutEventDetail, type ShortcutTrigger } from '@svelte-put/shortcut';
	import type { Direction } from '@/types';
	import { Record } from 'effect';
	import { getFiloManager } from '@/manager';

	//

	const manager = getFiloManager();

	//

	type ShortcutCallback = (detail: ShortcutEventDetail) => void;

	//

	const ArrowKeys = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'] as const;
	type ArrowKey = (typeof ArrowKeys)[number];

	const WASDKeys = ['w', 'a', 's', 'd'] as const;
	type WASDKey = (typeof WASDKeys)[number];

	const Directions = {
		Up: { dimension: 'y', sign: -1 },
		Down: { dimension: 'y', sign: 1 },
		Left: { dimension: 'x', sign: -1 },
		Right: { dimension: 'x', sign: 1 }
	} as const satisfies Record<string, Direction>;

	function createMoveBlockOutShortcuts(): ShortcutTrigger[] {
		const keyToDirection: Record<ArrowKey, Direction> = {
			ArrowUp: Directions.Up,
			ArrowDown: Directions.Down,
			ArrowLeft: Directions.Left,
			ArrowRight: Directions.Right
		};

		return Record.toEntries(keyToDirection).map(([key, direction]) => ({
			key,
			callback: preventDefault(() =>
				manager
					.state('positioning')
					?.moveBlockOut(direction)
					.pipe((c) => manager.run(c))
			)
		}));
	}

	function createMoveBlockInShortcuts(): ShortcutTrigger[] {
		const keyToDirection: Record<WASDKey, Direction> = {
			w: Directions.Up,
			s: Directions.Down,
			a: Directions.Left,
			d: Directions.Right
		};

		return Record.toEntries(keyToDirection).map(([key, direction]) => ({
			key,
			callback: preventDefault(() =>
				manager
					.state('positioning')
					?.moveBlockIn(direction)
					.pipe((c) => manager.run(c))
			)
		}));
	}

	function preventDefault(callback: ShortcutCallback): ShortcutCallback {
		return (detail) => {
			detail.originalEvent.preventDefault();
			callback(detail);
		};
	}

	const trigger: ShortcutTrigger[] = [
		{
			key: 'Enter',
			callback: preventDefault(() => {
				manager
					.state('focus')
					?.splitBlock()
					.pipe((c) => manager.run(c));
				manager
					.state('positioning')
					?.confirmBlockOut()
					.pipe((c) => manager.run(c));
			})
		},
		{
			key: 'Escape',
			callback: preventDefault(() => {
				manager
					.state('focus')
					?.exit()
					.pipe((c) => manager.run(c));
			})
		},
		{
			key: 'z',
			modifier: ['ctrl', 'meta'],
			callback: preventDefault(() => {
				manager.undo();
			})
		},
		{
			key: ' ',
			callback: preventDefault(() => {})
		},
		...createMoveBlockOutShortcuts(),
		...createMoveBlockInShortcuts()
	];
</script>

<svelte:window use:shortcut={{ trigger }} />
