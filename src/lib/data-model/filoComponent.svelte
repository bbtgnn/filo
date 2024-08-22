<script lang="ts">
	import Viewport from '$lib/components/viewport.svelte';
	import BlockCanvas from '$lib/components/blockCanvas.svelte';
	import BlockComponent from './blockComponent.svelte';
	import LinkCanvas from '$lib/components/linkCanvas.svelte';
	import LinkComponent from './linkComponent.svelte';
	import { Filo, setFilo } from './filo.svelte.js';

	type Props = {
		filo?: Filo;
	};

	let { filo = new Filo() }: Props = $props();
	setFilo(filo);
</script>

<Viewport>
	<LinkCanvas>
		{#each filo.links as link (link.id)}
			<LinkComponent {link} />
		{/each}
	</LinkCanvas>

	<BlockCanvas>
		{#each filo.blocks as block (block.id)}
			<BlockComponent {block} onSplit={filo.handleBlockSplit} />
		{/each}
	</BlockCanvas>
</Viewport>
