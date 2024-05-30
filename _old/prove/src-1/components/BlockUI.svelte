<script lang="ts">
  // Imports
  import type { Block } from "../classes/Block";
  import { createEventDispatcher } from "svelte";

  // Props
  export let block: Block;

  // Dispatch
  const dispatch = createEventDispatcher();
  function split() {
    dispatch("split", {
      block: block,
    });
  }
</script>

<div>
  <p>
    {block.text}
    <br />
    <br />
    <span><strong>{block.id}</strong></span>
  </p>
  <button on:click={split}>Split</button>
</div>

<style>
  p {
    background-color: #eee;
    padding: 10px;
    margin-bottom: 10px;
    max-width: 400px;
    line-height: 1.4;
    border-radius: 4px;
  }

  p:hover {
    background-color: #ddd;
  }

  /* .selected {
    border: 1px solid royalblue;
  }

  .unselectable {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .selectable {
    -webkit-user-select: initial;
    -moz-user-select: initial;
    -ms-user-select: initial;
    user-select: initial;
  } */
</style>
