<!--
SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { Block } from '@/block/block.svelte';
	import { Filo } from '@/filo/filo.svelte';
	import FiloComponent from '@/filo/filoComponent.svelte';
	import textSample from './text-sample.txt?raw';

	import { Storage } from '@/storage';

	// export let data;

	// const storage = new Storage(data.db);
	const filo = new Filo();
	const block = new Block('0', textSample);
	filo.addBlock(block);
</script>

<FiloComponent {filo} />
