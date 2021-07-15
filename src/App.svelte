<script>
  import Zone from "./components/Zone.svelte";
  import { blocks } from "./stores/blocks";
</script>

<Zone bind:items={$blocks} />
<pre>{JSON.stringify($blocks, null, 4)}</pre>