<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Block } from "../classes/Block";
  import { clickOutside } from "../functions/clickOutside";

  export let block: Block;

  let selected = false;
  let index = 0;

  const dispatch = createEventDispatcher();
  function split() {
    dispatch("split", {
      block: block,
      index: index,
    });
    selected = false;
  }

  function handleClickSplit(event) {
    let selection = window.getSelection();
    if (selection.isCollapsed) {
      if (event.target.getAttribute("data-side") == "right") {
        index = index + selection.anchorOffset;
      } else if (event.target.getAttribute("data-side") == "left") {
        index = selection.anchorOffset;
      }
    }
  }
</script>

<div
  class="content"
  on:click={() => {
    selected = true;
  }}
  use:clickOutside
  on:click_outside={() => {
    selected = false;
    index = 0;
  }}
>
  <span data-side="left" on:click={handleClickSplit}>
    {block.text.substring(0, index)}
  </span>
  {#if selected}
    <span class="cursor" on:click={split}>|</span>
  {/if}
  <span data-side="right" on:click={handleClickSplit}>
    {block.text.substring(index)}
  </span>
</div>

<style>
  .content {
    border: 1px solid black;
    min-width: 200px;
  }
  .cursor {
    margin: 0 -4px;
    color: red;
    padding: 0 4px;
  }
  .cursor:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
