import { DirectedGraph } from 'graphology';
import type { Entry } from '$lib/db/types';
import type { Action } from 'svelte/action';
import Sigma from 'sigma';
import type { Block, Link } from '$lib/db/schema';

export type WithCoords<T> = T & {
	x: number;
	y: number;
	i: number;
	j: number;
};

export type Graph = DirectedGraph<WithCoords<Block>, Link>;

export function initGraph(blocks: Entry<Block>[], links: Entry<Link>[]): Graph {
	const graph = new DirectedGraph<WithCoords<Entry<Block>>, Entry<Link>>();
	blocks.forEach((b) =>
		graph.addNode(b.id, { ...b, x: Math.random(), y: Math.random(), i: 0, j: 0 })
	);
	links.forEach((l) => graph.addEdge(l.in, l.out, l));
	return graph;
}

export const graphView: Action<HTMLElement, Graph> = (el, graph) => {
	new Sigma(graph, el);
};
