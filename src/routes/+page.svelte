<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	// import ForceGraph from '$lib/components/forceGraph.svelte';
	import { createBlock, createLink } from '$lib/db/queries.js';
	import { onMount } from 'svelte';

	export let data;
	let db = data.db;

	onMount(async () => {
		await createBlock('A', { text: 'ciao' }, db);
		await createBlock('B', { text: 'ciao' }, db);
		await createBlock('C', { text: 'ciao' }, db);
		await createBlock('D', { text: 'ciao' }, db);
		await createBlock('E', { text: 'ciao' }, db);
		await createBlock('F', { text: 'ciao' }, db);

		await createLink({ in: 'A', out: 'B', i: 0, j: 1 }, db);
		await createLink({ in: 'A', out: 'C', i: 0, j: 1 }, db);
		await createLink({ in: 'A', out: 'D', i: 0, j: 1 }, db);
		await createLink({ in: 'D', out: 'E', i: 1, j: 0 }, db);
		await createLink({ in: 'C', out: 'F', i: 0, j: 1 }, db);

		invalidateAll();
	});
</script>

<hr />

<div>
	<pre>{JSON.stringify(data.blocks, null, 2)}</pre>
	<pre>{JSON.stringify(data.links, null, 2)}</pre>
</div>

<!-- <ForceGraph blocks={data.blocks} links={data.links}></ForceGraph> -->
