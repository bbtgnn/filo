<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { getFiloManager } from '@/manager/index.svelte';
	import { untrack, type Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		class?: string;
	};

	const props: Props = $props();

	const manager = getFiloManager();
	const filo = manager.filo;

	$effect(() => untrack(() => filo.blocks.at(0))?.scrollIntoView());
	$effect(() => {
		manager.state('positioning')?.context.blocks.in.scrollIntoView();
	});
</script>

<div
	class="h-screen w-screen {props.class}"
	style="overflow: scroll; position: relative; background-color: gainsboro;"
>
	{#key filo.view.redrawKey}
		{#if props.children}
			{@render props.children()}
		{/if}
	{/key}
</div>
