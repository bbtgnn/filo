<script lang="ts">
	import Viewport from '$lib/components/viewport.svelte';
	import BlockCanvas from '$lib/components/blockCanvas.svelte';
	import BlockComponent from './blockComponent.svelte';
	import LinkCanvas from '$lib/components/linkCanvas.svelte';
	import LinkComponent from './linkComponent.svelte';
	import { Filo, setFilo } from './filo.svelte.js';
	import { shortcut, type ShortcutEventDetail, type ShortcutTrigger } from '@svelte-put/shortcut';
	import type { Direction } from './types';
	import { Record } from 'effect';

	type Props = {
		filo?: Filo;
	};

	let { filo = new Filo() }: Props = $props();
	setFilo(filo);

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
			callback: preventDefault(() => filo.moveBlockOut(direction))
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
			callback: preventDefault(() => filo.moveBlockIn(direction))
		}));
	}

	function preventDefault(callback: ShortcutCallback): ShortcutCallback {
		return (detail) => {
			detail.originalEvent.preventDefault();
			callback(detail);
		};
	}

	const commands: ShortcutTrigger[] = [
		...createMoveBlockOutShortcuts(),
		...createMoveBlockInShortcuts(),
		{ key: ' ', callback: preventDefault(() => filo.confirmBlockOut()) }
	];
</script>

<svelte:window use:shortcut={{ trigger: commands }} />

{#key filo.redrawKey}
	<Viewport>
		<LinkCanvas>
			{#each filo.links as link (link.id)}
				<LinkComponent {link} />
			{/each}
		</LinkCanvas>

		<BlockCanvas>
			{#each filo.blocks as block (block.id)}
				<BlockComponent {block} onSplit={filo.handleBlockSplit} />
			{/each}
		</BlockCanvas>
	</Viewport>
{/key}
