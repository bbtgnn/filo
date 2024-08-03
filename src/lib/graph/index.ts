import { DirectedGraph } from 'graphology';
import type { Dao } from '$lib/db/schema';
import type { Entry } from '$lib/db/types';
import type { Action } from 'svelte/action';
import Sigma from 'sigma';

type Block = Dao['Block']['Type'];
type Link = Dao['Link']['Type'];

type WithCoords<T> = T & {
	x: number;
	y: number;
};

type Graph = DirectedGraph<WithCoords<Entry<Block>>, Entry<Link>>;

export function initGraph(blocks: Entry<Block>[], links: Entry<Link>[]): Graph {
	const graph = new DirectedGraph<WithCoords<Entry<Block>>, Entry<Link>>();
	blocks.forEach((b) => graph.addNode(b.id, { ...b, x: Math.random(), y: Math.random() }));
	links.forEach((l) => graph.addEdge(l.in, l.out, l));
	return graph;
}

export const graphView: Action<HTMLElement, Graph> = (el, graph) => {
	new Sigma(graph, el);
};
