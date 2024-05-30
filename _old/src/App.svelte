<script lang="ts">
  import TextBlock from "./components/TextBlock.svelte";

  let texts = [
    { s: "The long road before the long dark", id: 1 },
    { s: "wewewew", id: 2 },
    { s: "Bho forse ma non so", id: 286 },
  ];

  function handleSplit(
    e: CustomEvent<{ text: string; index: number; id: number }>
  ) {
    const item = texts.filter((item) => item.id == e.detail.id)[0];
    const i = texts.indexOf(item);
    console.log(item, i);
    // Removing original
    texts.splice(i, 1);
    // Adding new
    texts.splice(i, 0, {
      s: e.detail.text.substring(e.detail.index),
      id: 865 + e.detail.id,
    });
    texts.splice(i, 0, {
      s: e.detail.text.substring(0, e.detail.index),
      id: 65 + e.detail.id,
    });
    // Updating list
    texts = [...texts];
  }
</script>

{#each texts as text (text.id)}
  <TextBlock text={text.s} id={text.id} on:split={handleSplit} />
{/each}
