<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { config } from '@/config';
	import type { Link, LinkAnchor } from './link.svelte';
	import { getFiloManager } from '@/manager/index.svelte';
	import type { Point } from '@/types';
	import type { Filo } from '@/filo/filo.svelte';
	import { dimensionToSize, getPerpendicularDimension } from '@/utils';

	type Props = {
		link: Link;
	};

	const { filo } = getFiloManager();

	const { link }: Props = $props();
	const { in: anchorIn, out: anchorOut } = $derived(link);

	const pointIn = $derived(linkAnchorToPoint(filo, anchorIn));
	const pointOut = $derived(linkAnchorToPoint(filo, anchorOut));

	function linkAnchorToPoint(filo: Filo, anchor: LinkAnchor): Point {
		const { block, side, order = 0 } = anchor;
		const { dimension: mainDimension, sign } = side;
		const perpendicularDimension = getPerpendicularDimension(mainDimension);

		const totalAnchors = filo.getBlockLinksBySide(anchor.block, anchor.side).length;
		const anchorsDistance = block[dimensionToSize(perpendicularDimension)] / (totalAnchors + 1);

		const mainDimensionIncrease = sign == 1 ? block[dimensionToSize(mainDimension)] : 0;
		const secondaryDimensionIncrease = anchorsDistance * (order + 1);

		return {
			[mainDimension]: block.absolutePosition[mainDimension] + mainDimensionIncrease,
			[perpendicularDimension]:
				block.absolutePosition[perpendicularDimension] + secondaryDimensionIncrease
		} as Point;
	}
</script>

<line x1={pointIn.x} y1={pointIn.y} x2={pointOut.x} y2={pointOut.y} stroke="black" />

<!-- <line
	x1={anchorIn.block.absolutePosition.x}
	y1={anchorIn.block.absolutePosition.y}
	x2={anchorOut.block.absolutePosition.x}
	y2={anchorOut.block.absolutePosition.y}
	stroke="black"
/> -->
