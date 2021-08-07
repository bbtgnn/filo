<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { clickOutside } from "../functions/clickOutside";

  export let text: string;
  export let id: number;

  let index = 0;

  const dispatch =
    createEventDispatcher<{
      split: { text: string; index: number; id: number };
    }>();
  function split() {
    dispatch("split", {
      text,
      index,
      id,
    });
  }

  function handleClick(event) {
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
  use:clickOutside
  on:click_outside={() => {
    index = 0;
  }}
>
  {#if text.substring(0, index).length > 0}
    <span data-side="left" on:click={handleClick}>
      {text.substring(0, index)}
    </span>
  {/if}

  {#if index > 0 && index < text.length}
    <span class="cursor" on:click={split}>|</span>
  {/if}

  {#if text.substring(index).length > 0}
    <span data-side="right" on:click={handleClick}>
      {text.substring(index)}
    </span>
  {/if}
</div>

<style>
  div {
    border: 1px solid black;
    padding: 4px;
  }

  .cursor {
    color: red;
    padding: 0 4px;
    user-select: none;
  }

  .cursor:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
