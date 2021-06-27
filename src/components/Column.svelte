<script lang="ts">
  // Imports
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import BlockUI from "./BlockUI.svelte";
  import type { Block } from "../classes/Block";

  // Props
  export let items: Array<Block>;

  // Consts
  const flipDurationMs = 200;

  function handleSort(e) {
    items = e.detail.items;
  }
</script>

<section
  use:dndzone={{ items, flipDurationMs }}
  on:consider={handleSort}
  on:finalize={handleSort}
>
  {#each items as item (item.id)}
    <div animate:flip={{ duration: flipDurationMs }}>
      <BlockUI block={item} />
    </div>
  {/each}
</section>

<style>
  section {
    width: 12em;
    padding: 1em;
    border: 1px solid black;
  }
</style>
