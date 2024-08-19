<script lang="ts">
	import { config } from '$lib/config';
	const { width, height } = config.viewport;
</script>

<div style:--w="{width}px" style:--h="{height}px">
	<slot />
</div>

<style>
	div {
		width: var(--w);
		height: var(--h);
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
