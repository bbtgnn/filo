<script>
  import Content from "./components/Content.svelte";
  import Zone from "./components/Zone.svelte";
  import { blocks } from "./stores/blocks";
  import { dragDisabled } from "./stores/dragDisabled";
</script>

<Zone bind:items={$blocks} />
<pre>{JSON.stringify($blocks, null, 4)}</pre>
