<script lang="ts">
	import BlockCanvas from '$lib/components/blockCanvas.svelte';
	import LinkCanvas from '$lib/components/linkCanvas.svelte';
	import Viewport from '$lib/components/viewport.svelte';
	import { Filo, setFilo } from './filo.svelte.js';

	type Props = {
		filo: Filo;
	};

	let { filo }: Props = $props();
	setFilo(filo);
</script>

<Viewport id={filo.id}>
	<LinkCanvas />
	<BlockCanvas />

	<!-- {#if filo.blocksQueue.length > 0}
            <div id="queue" style="background-color: antiquewhite;">
                {#each filo.blocksQueue as block}
                    <div>
                        <p>{block.id.toString()}</p>
                        <p>{block.text}</p>
                    </div>
                {/each}
            </div>
        {/if} -->
</Viewport>
