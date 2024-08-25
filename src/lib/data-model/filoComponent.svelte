<script lang="ts">
	import Viewport from '$lib/components/viewport.svelte';
	import BlockCanvas from '$lib/components/blockCanvas.svelte';
	import BlockComponent from './blockComponent.svelte';
	import LinkCanvas from '$lib/components/linkCanvas.svelte';
	import LinkComponent from './linkComponent.svelte';
	import { Filo, setFilo } from './filo.svelte.js';
	import { shortcut, type ShortcutEventDetail, type ShortcutTrigger } from '@svelte-put/shortcut';
	import type { Dimension, Point, Sign } from './types';
	import { Link } from './link.svelte';
	import type { RBushArea } from './solver';
	import { config } from '$lib/config';
	import { tick } from 'svelte';

	type Props = {
		filo?: Filo;
	};

	let { filo = $bindable(new Filo()) }: Props = $props();
	setFilo(filo);

	//

	type ShortcutCallback = (detail: ShortcutEventDetail) => void;

	const moveBlockOut: ShortcutCallback = (detail) => {
		if (!filo.blockIn || !filo.blockOut || !filo.currentLink) return;
		const e = detail.originalEvent;
		e.preventDefault();

		const linkData: Record<string, { sign: Sign; dimension: Dimension }> = {
			ArrowDown: { dimension: 'y', sign: 1 },
			ArrowUp: { dimension: 'y', sign: -1 },
			ArrowRight: { dimension: 'x', sign: 1 },
			ArrowLeft: { dimension: 'x', sign: -1 }
		};

		const { dimension, sign } = linkData[detail.originalEvent.key];
		const newLink = new Link(filo.blockIn, filo.blockOut, dimension, sign);

		filo.solver.removeLink(filo.currentLink);
		filo.solver.addLink(newLink);
		filo.currentLink = newLink;
		filo.solver.updateVariables();
		filo.redraw();
	};

	const moveBlockIn: ShortcutCallback = (detail) => {
		if (!filo.blockIn || !filo.blockOut || !filo.currentLink) return;
		const e = detail.originalEvent;
		e.preventDefault();

		console.log(filo.solver.tree);

		const leftArea: RBushArea = {
			minX: filo.blockIn.position.x - config.maxSearchDistance,
			maxX: filo.blockIn.position.x - 10,
			minY: filo.blockIn.position.y,
			maxY: filo.blockIn.position.y + filo.blockIn.size.height // TODO - maybe add tolerance
		};

		const res = filo.solver.tree.search(leftArea);
		console.log(res);

		// // TODO - meccanismo per trovare i blocchi in una data direzione

		// const positions: Record<string, Point> = {
		// 	w: { x: 0, y: -1 },
		// 	s: { x: 0, y: 1 },
		// 	a: { x: -1, y: 0 },
		// 	d: { x: 1, y: 0 }
		// };
		// const nextPosition = positions[e.key];
		// const nextBlock = filo.blocks.find(
		// 	(b) =>
		// 		b.position.x == filo.blockIn!.position.x + nextPosition.x &&
		// 		b.position.y == filo.blockIn!.position.y + nextPosition.y
		// );
		// if (!nextBlock) return;

		// filo.removeLink(filo.currentLink);
		// filo.blockIn = nextBlock;
		// const { sign, dimension } = filo.currentLink;
		// filo.currentLink = new Link(filo.blockIn, filo.blockOut, dimension, sign);
		// filo.addLink(filo.currentLink);
		// filo.solver.updateVariables();
		// filo.redraw();
	};

	const confirmBlockOut: ShortcutCallback = async (detail) => {
		if (!filo.blockIn || !filo.blockOut || !filo.currentLink) return;
		const e = detail.originalEvent;
		e.preventDefault();

		filo.blocks.push(filo.blockOut);
		filo.links.push(filo.currentLink);

		if (!filo.blockQueue) {
			filo.blockIn = undefined;
			filo.blockOut = undefined;
			filo.currentLink = undefined;
		} else {
			filo.blockIn = filo.blockOut;
			filo.blockOut = filo.blockQueue;
			filo.blockQueue = undefined;
			filo.currentLink = filo.linkQueue;
			filo.linkQueue = undefined;
		}
	};

	const commands: ShortcutTrigger[] = [
		...['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].map((key) => ({
			key,
			callback: moveBlockOut
		})),
		...['w', 'a', 's', 'd'].map((key) => ({ key, callback: moveBlockIn })),
		{ key: ' ', callback: confirmBlockOut }
	];
</script>

<svelte:window use:shortcut={{ trigger: commands }} />

{#key filo.redrawKey}
	<Viewport>
		<LinkCanvas>
			{#each filo.links as link (link.id)}
				<LinkComponent {link} />
			{/each}

			{#if filo.currentLink}
				<LinkComponent link={filo.currentLink} />
			{/if}
			{#if filo.linkQueue}
				<LinkComponent link={filo.linkQueue} />
			{/if}
		</LinkCanvas>

		<BlockCanvas>
			{#each filo.blocks as block (block.id)}
				<BlockComponent {block} onSplit={filo.handleBlockSplit} />
			{/each}

			{#if filo.blockOut}
				<BlockComponent block={filo.blockOut} />
			{/if}
			{#if filo.blockQueue}
				<BlockComponent block={filo.blockQueue} />
			{/if}
		</BlockCanvas>
	</Viewport>
{/key}
