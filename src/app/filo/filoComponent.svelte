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

	import { FiloManager, setFiloManager } from '@/manager/index.svelte';
	import FiloControls from './filoControls.svelte';

	type Props = {
		filo: Filo;
	};

	const { filo }: Props = $props();

	const manager = new FiloManager(filo);
	setFiloManager(manager);
</script>

<FiloControls></FiloControls>

<div id="debug" class="flex h-[400px] divide-x-2 overflow-y-scroll bg-black text-white">
	<div class="grow p-2">
		<ul>
			{#each manager.undoStack as cmd}
				<li>{cmd.name}</li>
			{/each}
		</ul>
	</div>
	<div class="grow">
		{#each manager.stateHistory as state, index}
			<div class="border-b p-2">
				<p>{state.constructor.name}</p>
				{#if state.context.blocks}
					{@const blocks = Object.values(state.context.blocks)}
					<ul>
						{#each blocks as block}
							{@const exists = manager.filo.blocks.includes(block)}
							{@const symbol = exists ? '✅' : '❌'}
							<li>{block.id} {symbol}</li>
						{/each}
					</ul>
				{/if}
				{#if state.context.links}
					{@const links = Object.values(state.context.links)}
					<ul>
						{#each links as link}
							{@const exists = manager.filo.links.includes(link)}
							{@const symbol = exists ? '✅' : '❌'}
							<li>{link.id} {symbol}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
	<div class="grow p-2">
		<ul>
			{#each manager.filo.blocks as b}
				<li>{b.id}</li>
			{/each}
		</ul>
		<ul>
			{#each manager.filo.links as l}
				<li>{l.id}</li>
			{/each}
		</ul>
	</div>
</div>

<ViewComponent>
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
