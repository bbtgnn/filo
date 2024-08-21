<script lang="ts">
	import { Block } from '$lib/data-model/block.svelte';
	import { Filo } from '$lib/data-model/filo.svelte';
	import { onMount } from 'svelte';
	import { Maybe } from 'true-myth';

	onMount(() => {
		new Maybe(document.querySelector('main'))
			.map((element) => new Filo(element))
			.map((filo) => {
				const b = new Block('A', 'ciao');
				filo.addBlock(b);
				b.scrollIntoView();
				return b;
			});
	});
</script>

<main></main>
