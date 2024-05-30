<script>
  import { flip } from "svelte/animate";
  import {
    dndzone,
    SOURCES,
    TRIGGERS,
    SHADOW_PLACEHOLDER_ITEM_ID,
  } from "svelte-dnd-action";

  import { splitParagraph } from "../functions/splitParagraph";

  import Content from "./Content.svelte";

  import { dragDisabled } from "../stores/dragDisabled";

  import { nodes } from "../stores/nodes";

  export let items = [];

  const flipDurationMs = 300;

  function handleConsider(e) {
    const {
      items: newItems,
      info: { source, trigger },
    } = e.detail;
    items = newItems;
    // Ensure dragging is stopped on drag finish via keyboard
    if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
      dragDisabled.set(true);
    }
  }

  function handleFinalize(e) {
    const {
      items: newItems,
      info: { source },
    } = e.detail;
    items = newItems;
    nodes.set({ ...$nodes });
    // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
    if (source === SOURCES.POINTER) {
      dragDisabled.set(true);
    }
  }

  function startDrag(e) {
    // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
    e.preventDefault();
    dragDisabled.set(false);
  }

  function handleKeyDown(e) {
    if ((e.key === "Enter" || e.key === " ") && $dragDisabled)
      dragDisabled.set(false);
  }

  function handleSplit(e) {
    console.log(e.detail);
    const selection = document.getSelection().toString();
    if (selection.trim() != "") {
      const new_text = splitParagraph(e.detail.node.text, selection);
      console.log(new_text);
      // const index = blocks.indexOf(e.detail.block);
      // const first_p = blocks.slice(0, index);
      // const second_p = blocks.slice(index + 1);
      // blocks = [...first_p, ...new_blocks, ...second_p];
    }
  }
</script>

<section
  use:dndzone={{
    items,
    flipDurationMs,
    dragDisabled: $dragDisabled,
    centreDraggedOnCursor: true,
  }}
  on:consider={handleConsider}
  on:finalize={handleFinalize}
>
  {#if items.length > 0}
    <!-- WE FILTER THE SHADOW PLACEHOLDER THAT WAS ADDED IN VERSION 0.7.4, filtering this way rather than checking whether 'nodes' have the id became possible in version 0.9.1 -->
    {#each items.filter((item) => item.id !== SHADOW_PLACEHOLDER_ITEM_ID) as item (item.id)}
      <div animate:flip={{ duration: flipDurationMs }} class="item">
        <div
          tabindex={$dragDisabled ? 0 : -1}
          aria-label="drag-handle"
          class="handle"
          style={$dragDisabled ? "cursor: grab" : "cursor: grabbing"}
          on:mousedown={startDrag}
          on:touchstart={startDrag}
          on:keydown={handleKeyDown}
        />
        <Content node={$nodes[item.id]} on:split={handleSplit} />
      </div>
    {/each}
  {/if}
</section>

<style>
  section {
    width: auto;
    border: 1px solid black;
    padding: 20px;
    /* this will allow the dragged element to scroll the list */
    overflow-y: auto;
    height: auto;
    background-color: rgba(100, 100, 100, 0.1);
  }

  .handle {
    width: 100%;
    height: 1em;
    background-color: red;
  }

  .item {
    background-color: rgba(00, 100, 100, 0.1);
    margin-bottom: 20px;
  }

  .item:last-child {
    margin-bottom: 0;
  }
</style>
