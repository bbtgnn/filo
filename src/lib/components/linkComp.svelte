<script lang="ts">
	import { config } from '$lib/config';
	import type { Link } from '$lib/db/schema.svelte';

	type Props = {
		link: Link;
	};

	let { link }: Props = $props();
	let { x: x1, y: y1 } = $derived(link.in.coordinates);
	let { x: x2, y: y2 } = $derived(link.out.coordinates);
	const { padding: p } = config.block;
</script>

<line x1={x1 + p} y1={y1 + p} x2={x2 + p} y2={y2 + p} stroke="black" />
