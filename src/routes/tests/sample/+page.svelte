<script lang="ts">
	import { Block } from '$lib/data-model/block.svelte';
	import { Filo } from '$lib/data-model/filo.svelte';
	import FiloComponent from '$lib/data-model/filoComponent.svelte';
	import textSample from './text-sample.txt?raw';

	const filo = new Filo();
	const block = new Block(filo, '0', textSample);
	filo.addBlock(block);
</script>

<FiloComponent {filo} />
