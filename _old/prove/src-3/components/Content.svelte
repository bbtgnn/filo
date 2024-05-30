<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Zone from "./Zone.svelte";
  import TextBlock from "./TextBlock.svelte";
  import type { Block } from "../classes/Block";

  export let block: Block;

  const dispatch = createEventDispatcher();
  function handleSplit(e) {
    const blocks: Array<Block> = e.detail.block.split(e.detail.selection);
    block = blocks[0];
    block.items_bottom = [...blocks.slice(1), ...block.items_bottom];
  }
</script>

<div class="row">
  <Zone bind:items={block.items_left} />
  <div class="col">
    <TextBlock {block} on:split={handleSplit} />
    <Zone bind:items={block.items_bottom} />
  </div>
  <Zone bind:items={block.items_right} />
</div>

<style>
  .row {
    display: flex;
    flex-flow: row nowrap;
  }

  .col {
    display: flex;
    flex-flow: column nowrap;
  }
</style>
