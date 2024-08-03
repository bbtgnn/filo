<script lang="ts">
	import { initGraph, graphView } from '$lib/graph/index.js';
	import forceLayout from 'graphology-layout-force';
	import ForceSupervisor from 'graphology-layout-force/worker';
	import { onMount } from 'svelte';

	// import { invalidateAll } from '$app/navigation';
	// // import ForceGraph from '$lib/components/forceGraph.svelte';
	// import { createBlock, createLink } from '$lib/db/queries.js';
	// import { onMount } from 'svelte';

	// import { sortLinks } from '$lib/draw/index.js';
	// import type { DbBlock } from '$lib/db/schema.js';
	// import { Block } from '$lib/draw/old.js';

	export let data;
	let { blocks, dimensions, links } = data;

	const graph = initGraph(blocks, links);

	onMount(() => {
		const layout = new ForceSupervisor(graph);
		layout.start();
	});

	// function dbBlockToBlock(b: DbBlock): Block {
	// 	return new Block({ content: b.text, abstractPosition: { x: b.j, y: b.i } }); // Todo: add last dimension
	// }

	// onMount(async () => {
	// 	// sortLinks(blocks, links);
	// 	// preprocessLinks(blocks);
	// 	// redraw();
	// 	// drawLinks(blocks, inputs);
	// 	// redraw();
	// });
</script>

<hr />

<div
	use:graphView={graph}
	style="width: 100vw;; height: 500px; background-color: lightgoldenrodyellow;"
></div>

<div>
	<pre>{JSON.stringify(blocks, null, 2)}</pre>
	<pre>{JSON.stringify(dimensions, null, 2)}</pre>
	<pre>{JSON.stringify(links, null, 2)}</pre>
</div>

<!-- <ForceGraph blocks={data.blocks} links={data.links}></ForceGraph> -->
