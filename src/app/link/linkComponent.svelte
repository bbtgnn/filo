<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { config } from '@/config';
	import type { Link } from './link.svelte';

	type Props = {
		link: Link;
	};

	let { link }: Props = $props();
	let { x: x1, y: y1 } = $derived(link.in.absolutePosition);
	let { x: x2, y: y2 } = $derived(link.out.absolutePosition);
	const { padding: p } = config.block;
</script>

<line x1={x1 + p} y1={y1 + p} x2={x2 + p} y2={y2 + p} stroke="black" />
