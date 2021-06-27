<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Block } from "../classes/Block";

  export let block: Block;

  const dispatch = createEventDispatcher();
  function split() {
    dispatch("split", {
      block: block,
      selection: document.getSelection().toString(),
    });
  }
</script>

<div class="content">{block.text}</div>
<button on:click={split}>split</button>

<style>
  .content {
    border: 1px solid black;
    min-width: 200px;
  }
</style>
