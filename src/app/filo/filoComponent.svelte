<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import ViewComponent from '@/view/viewComponent.svelte';
	import BlockCanvas from '@/view/blockCanvas.svelte';
	import BlockComponent from '@/block/blockComponent.svelte';
	import LinkCanvas from '@/view/linkCanvas.svelte';
	import LinkComponent from '@/link/linkComponent.svelte';
	import { Filo } from './filo.svelte';

	import { FiloManager, setFiloManager } from '@/states/index.svelte';
	import FiloControls from './filoControls.svelte';

	type Props = {
		filo: Filo;
	};

	const { filo }: Props = $props();

	const manager = new FiloManager(filo);
	setFiloManager(manager);
</script>

<FiloControls></FiloControls>

<ViewComponent>
	{#if manager.currentState && 'context' in manager.currentState}
		<div>
			<pre>{JSON.stringify(manager.currentState.context, null, 4)}</pre>
		</div>
	{/if}

	<LinkCanvas>
		{#each filo.links as link (link.id)}
			<LinkComponent {link} />
		{/each}
	</LinkCanvas>

	<BlockCanvas>
		{#each filo.blocks as block (block.id)}
			<BlockComponent {block} />
		{/each}
	</BlockCanvas>
</ViewComponent>

<style>
	div {
		position: fixed;
		top: 0;
		left: 0;
		padding: 10px;
		background-color: black;
		color: white;
	}
</style>
