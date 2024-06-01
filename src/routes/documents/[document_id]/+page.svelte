<script lang="ts">
	import Token, { currentCursor } from '$lib/components/token.svelte';

	//

	export let data;
	let { text } = data;

	//

	function on_key_down(e: KeyboardEvent) {
		switch (e.key) {
			case 'Enter':
				console.log('Enter key pressed');
				break;
			case 'ArrowUp':
				console.log('Arrow Up key pressed');
				break;
			case 'ArrowDown':
				break;
			case 'ArrowLeft':
				$currentCursor -= 1;
				break;
			case 'ArrowRight':
				$currentCursor += 1;
				break;
			default:
				// You can handle other keys if needed
				break;
		}
	}
</script>

<svelte:window on:keydown|preventDefault={on_key_down} />

<div>
	{#each text as token}
		<Token {token} />
	{/each}
</div>
