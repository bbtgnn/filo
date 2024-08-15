<script lang="ts">
	import BlockComp from './blockComp.svelte';
	import { RecordId } from 'surrealdb.js';
	import type { Token } from './lib';
	import { pipe, Array } from 'effect';

	export let data;

	let tokens: Token[] = [data.text];
</script>

{#each tokens as token}
	<BlockComp
		block={token}
		onSplit={(newTokens, oldToken) => {
			const index = tokens.indexOf(oldToken);
			tokens.splice(index, 1);
			tokens = [...tokens.slice(0, index), ...newTokens, ...tokens.slice(index)];
		}}
	/>
{/each}
