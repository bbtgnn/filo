import { DirectedGraph } from 'graphology';
import type { Action } from 'svelte/action';
import Sigma from 'sigma';
import type { Block, Link } from '$lib/db/schema';

export type Graph = DirectedGraph<Block, Link>;

export function initGraph(blocks: Block[], links: Link[]): Graph {
	const graph = new DirectedGraph<Block, Link>();
	blocks.forEach((b) => graph.addNode(b.id, b));
	links.forEach((l) => graph.addEdge(l.in, l.out, l));
	return graph;
}

export const graphView: Action<HTMLElement, Graph> = (el, graph) => {
	new Sigma(graph, el);
};
