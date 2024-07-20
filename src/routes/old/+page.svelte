<script lang="ts">
	import BlockComponent from '$lib/components/block.svelte';
	import { Block, type Inputs } from '$lib/draw/old';
	import { onMount } from 'svelte';
	import { drawLinks, preprocessLinks, sortLinks } from '$lib/draw';

	const blocks: Block[] = [
		new Block({
			content:
				'Ciao a tutti (Blocco A) Ciao a tutti (Blocco A) Ciao a tutti (Blocco A) Ciao a tutti (Blocco A)',
			id: 'A'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco B)',
			id: 'B'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco C)',
			id: 'C'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco D)',
			id: 'D'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco E)',
			id: 'E'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco E)',
			id: 'F'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco E)',
			id: 'G'
		}),
		new Block({
			content: 'Ciao a tutti (Blocco E)',
			id: 'H'
		})
	];

	const inputs: Inputs = [
		{
			anchor: 'A',
			block: 'B',
			position: 'right'
		},
		{
			anchor: 'A',
			block: 'C',
			position: 'right'
		},
		{
			anchor: 'A',
			block: 'D',
			position: 'right'
		},
		{
			anchor: 'A',
			block: 'E',
			position: 'right'
		},
		{
			anchor: 'E',
			block: 'F',
			position: 'right'
		},
		{
			anchor: 'E',
			block: 'G',
			position: 'right'
		},
		{
			anchor: 'E',
			block: 'H',
			position: 'right'
		}
	];

	let redrawKey = '';

	onMount(() => {
		sortLinks(blocks, inputs);
		preprocessLinks(blocks);
		redraw();
		drawLinks(blocks, inputs);
		redraw();
	});

	function redraw() {
		redrawKey = Math.random().toString();
	}
</script>

{#key redrawKey}
	<div>
		{#each blocks as b}
			<BlockComponent block={b}></BlockComponent>
		{/each}
	</div>
{/key}

<style>
	div {
		position: relative;
	}
</style>
