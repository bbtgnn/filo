<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		id?: string;
	};

	let { children }: Props = $props();
</script>

<div
	style="width: 100vw; height: 90vh; overflow: scroll; position: relative; background-color: gainsboro;"
>
	{#if children}
		{@render children()}
	{/if}
</div>
