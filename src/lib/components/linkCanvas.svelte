<script lang="ts">
	import { config } from '$lib/config';
	import { getFilo } from '$lib/data-model/filo.svelte';
	const { width, height } = config.viewport;

	const filo = getFilo();
</script>

<svg
	id={filo.ids.linkCanvas}
	viewBox="0 0 {width} {height}"
	style:--w="{width}px"
	style:--h="{height}px"
>
	<slot />
</svg>

<style>
	svg {
		width: var(--w);
		height: var(--h);
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
