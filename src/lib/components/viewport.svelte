<script lang="ts">
	import { uuidv7 } from 'surrealdb.js';
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		id?: string;
	};

	let { children, id = uuidv7() }: Props = $props();
</script>

<div
	{id}
	style="width: 100vw; height: 90vh; overflow: scroll; position: relative; background-color: gainsboro;"
>
	{#if children}
		{@render children()}
	{/if}
</div>
