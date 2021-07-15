<script lang="ts">
  export let node;
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  function split() {
    dispatch("split", {
      node: node,
    });
  }
</script>

<div class="content">{node.text}</div>
<button on:click={split}>split</button>

<style>
  .content {
    border: 1px solid black;
    min-width: 200px;
  }
</style>
