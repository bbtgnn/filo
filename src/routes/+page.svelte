<script lang="ts">
	import { initGraph, graphView, type WithCoords } from '$lib/graph/index.js';
	import forceLayout from 'graphology-layout-force';
	import ForceSupervisor from 'graphology-layout-force/worker';
	import { onMount } from 'svelte';
	import { bfs } from 'graphology-traversal';
	import type { Entry } from '$lib/db/types.js';
	import { Block, Link } from '$lib/db/schema.js';

	// import { invalidateAll } from '$app/navigation';
	// // import ForceGraph from '$lib/components/forceGraph.svelte';
	// import { createBlock, createLink } from '$lib/db/queries.js';
	// import { onMount } from 'svelte';

	// import { sortLinks } from '$lib/draw/index.js';
	// import type { DbBlock } from '$lib/db/schema.js';
	// import { Block } from '$lib/draw/old.js';

	export let data;
	let { blocks, dimensions, links } = data;

	let graph = initGraph(blocks, links);

	onMount(() => {
		const layout = new ForceSupervisor(graph);
		layout.start();
	});

	let isFirst = true;

	bfs(
		graph,
		function (nodeId, attr, depth) {
			console.log('---------');
			console.log(nodeId);
			console.log('-');
			graph.forEachOutEdge(
				nodeId,
				(edgeId, edgeAttributes, sourceId, targetId, sourceAttributes, targetAttributes) => {
					assignCoordinatesToEdgeTarget(targetId, sourceAttributes, edgeAttributes);
				}
			);
		},
		{ mode: 'out' }
	);

	function assignCoordinatesToEdgeTarget(
		targetId: string,
		sourceAttributes: WithCoords<Entry<Block>>,
		edgeAttributes: Entry<Link>
	) {
		const { i, j } = getCoordinatesByDimension(sourceAttributes, edgeAttributes);
		const existingNode = findNodeByIJ(i, j);
		if (!existingNode) assignCoordinatesToNode(targetId, i, j);
		else solveConflicts(existingNode, targetId);
	}

	function getCoordinatesByDimension(
		nodeAttributes: WithCoords<Entry<Block>>,
		edgeAttributes: Entry<Link>
	) {
		if (edgeAttributes.dimension.id == 'x')
			return {
				i: nodeAttributes.i + 1 * edgeAttributes.sign,
				j: nodeAttributes.j
			};
		// y
		else
			return {
				i: nodeAttributes.i,
				j: nodeAttributes.j + 1 * edgeAttributes.sign
			};
	}

	function findNodeByIJ(i: number, j: number) {
		return graph.findNode((nodeId, nodeAttributes) => {
			return nodeAttributes.i == i && nodeAttributes.j == j;
		});
	}

	function assignCoordinatesToNode(nodeId: string, i: number, j: number) {
		graph.setNodeAttribute(nodeId, 'i', i);
		graph.setNodeAttribute(nodeId, 'j', j);
	}

	function solveConflicts(previousNode: string, conflictNote: string) {}

	// Svelte reactivity update
	graph = graph;

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

<!-- <div>
	<pre>{JSON.stringify(blocks, null, 2)}</pre>
	<pre>{JSON.stringify(dimensions, null, 2)}</pre>
	<pre>{JSON.stringify(links, null, 2)}</pre>
</div> -->

<pre>{JSON.stringify(Array.from(graph.nodeEntries()), null, 4)}</pre>

<!-- <ForceGraph blocks={data.blocks} links={data.links}></ForceGraph> -->
