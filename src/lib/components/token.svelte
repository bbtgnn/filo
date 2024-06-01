<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	export const currentCursor = writable(0);
</script>

<script lang="ts">
	import { type Token } from '$lib';
	import clsx from 'clsx';

	//

	export let token: Token;

	//

	$: if ($currentCursor === token.index) {
		token.state = 'selected';
	} else {
		token.state = 'default';
	}

	$: classes = clsx('p-1', {
		'bg-yellow-300': token.state == 'selected'
	});
</script>

<span class={classes}>
	{token.text}
</span>
