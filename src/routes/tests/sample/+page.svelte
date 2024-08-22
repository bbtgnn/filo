<script lang="ts">
	import { Filo } from '$lib/data-model/filo.svelte';
	import FiloComponent from '$lib/data-model/filoComponent.svelte';

	const filo = new Filo();
</script>

<FiloComponent {filo} />
