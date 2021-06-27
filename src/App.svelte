<script lang="ts">
  import { text } from "./test/sampleText";
  import { Block } from "./classes/Block";
  import BlockUI from "./components/BlockUI.svelte";
  import Column from "./components/Column.svelte";

  let blocks: Array<Block> = [new Block("0", text)];

  function handleSplit(event) {
    const selection = document.getSelection().toString();
    if (selection.trim() != "") {
      const new_blocks = event.detail.block.split(selection);
      const index = blocks.indexOf(event.detail.block);
      const first_p = blocks.slice(0, index);
      const second_p = blocks.slice(index + 1);
      blocks = [...first_p, ...new_blocks, ...second_p];
    }
  }
</script>

<main>
  <Column items={blocks} />
</main>

<style>
  main {
    padding: 10px;
  }
</style>
