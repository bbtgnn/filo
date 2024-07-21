<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	// import ForceGraph from '$lib/components/forceGraph.svelte';
	import { createBlock, createLink } from '$lib/db/queries.js';
	import { onMount } from 'svelte';

	import { sortLinks } from '$lib/draw/index.js';
	import type { DbBlock } from '$lib/db/schema.js';
	import { Block } from '$lib/draw/old.js';

	export let data;
	let { blocks, links } = data;

	// function dbBlockToBlock(b: DbBlock): Block {
	// 	return new Block({ content: b.text, abstractPosition: { x: b.j, y: b.i } }); // Todo: add last dimension
	// }

	onMount(async () => {
		// sortLinks(blocks, links);
		// preprocessLinks(blocks);
		// redraw();
		// drawLinks(blocks, inputs);
		// redraw();
	});
</script>

<hr />

<div>
	<pre>{JSON.stringify(blocks, null, 2)}</pre>
	<pre>{JSON.stringify(links, null, 2)}</pre>
</div>

<!-- <ForceGraph blocks={data.blocks} links={data.links}></ForceGraph> -->
