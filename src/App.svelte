<script>
  import Content from "./components/Content.svelte";
  import { nodes } from "./stores/nodes";
</script>

<Content node={$nodes.node1} />
<pre>{JSON.stringify($nodes, null, 4)}</pre>
