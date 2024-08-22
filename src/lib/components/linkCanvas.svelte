<script lang="ts">
	import { config } from '$lib/config';
	const { width, height } = config.viewport;
</script>

<svg viewBox="0 0 {width} {height}" style:--w="{width}px" style:--h="{height}px">
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
