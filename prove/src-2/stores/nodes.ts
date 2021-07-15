import { writable } from "svelte/store";

let nodes_b = {
  node1: {
    text: "node 1",
    items_bottom: [{ id: "node2" }, { id: "node3" }, { id: "node4" }],
    items_left: [],
    items_right: [],
    id: "node1",
  },
  node2: {
    text: "node 2",
    items_bottom: [
      { id: "node5" },
      { id: "node6" },
      { id: "node7" },
      { id: "node8" },
    ],
    items_left: [],
    items_right: [],
    id: "node2",
  },
  node3: {
    text: "node 3",
    items_bottom: [
      { id: "node9" },
      { id: "node10" },
      { id: "node11" },
      { id: "node12" },
    ],
    items_left: [],
    items_right: [],
    id: "node3",
  },
  node4: {
    text: "node 4",
    items_bottom: [
      { id: "node13" },
      { id: "node14" },
      { id: "node15" },
      { id: "node16" },
    ],
    items_left: [],
    items_right: [],
    id: "node4",
  },
};

for (let i = 5; i < 17; i++) {
  nodes_b[`node${i}`] = {
    id: `${i}`,
    text: `node ${i}`,
    items_bottom: [],
    items_left: [],
    items_right: [],
  };
}

export const nodes = writable(nodes_b);
