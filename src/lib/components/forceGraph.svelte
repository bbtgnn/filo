<script lang="ts">
	import type { Block, Link } from '$lib/db/schema';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { Record as R } from 'effect';

	export let blocks: (Block & { id: string })[];
	export let links: (Link & { id: string })[];

	let el: HTMLDivElement;
	let graphSvg: SVGSVGElement | null = null;

	onMount(() => {
		const width = 928;
		const height = 680;

		const bs = blocks.map((b) => ({ ...b, x: 0, y: 0 }));
		const ls = links.map((l) => ({
			...l,
			source: bs.find((b) => b.id == l.in)!,
			target: bs.find((b) => b.id == l.out)!
		}));

		// Create a simulation with several forces.
		const simulation = d3
			.forceSimulation(bs)
			.force(
				'link',
				d3.forceLink(ls).id((d) => d.id)
			)
			.force('charge', d3.forceManyBody())
			.force('x', d3.forceX())
			.force('y', d3.forceY());

		console.log(simulation.nodes());
	});
</script>

<div bind:this={el}>
	{@html graphSvg}
</div>
