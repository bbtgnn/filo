<script>
  import Zone from "./Zone.svelte";
  import Block from "./Block.svelte";

  export let node;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  function split(e) {
    dispatch("split", {
      node: e.detail.node,
    });
  }
</script>

<div class="row">
  <Zone bind:items={node.items_left} />
  <div class="col">
    <Block {node} on:split={split} />
    <Zone bind:items={node.items_bottom} />
  </div>
  <Zone bind:items={node.items_right} />
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
