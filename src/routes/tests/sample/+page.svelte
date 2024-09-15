<script lang="ts">
	import { Block } from '$lib/data-model/block.svelte';
	import { Filo } from '$lib/data-model/filo.svelte';
	import FiloComponent from '$lib/data-model/filoComponent.svelte';
	import textSample from './text-sample.txt?raw';

	import { Storage } from '$lib/data-model/storage';

	export let data;

	const storage = new Storage(data.db);
	const filo = new Filo(storage);
	const block = new Block(filo, '0', textSample);
	filo.addBlock(block);
</script>

<FiloComponent {filo} />
