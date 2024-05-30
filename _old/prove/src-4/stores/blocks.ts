import { writable } from "svelte/store";
import { Block } from "../classes/Block";

// const blocks: Array<Block> = [
//   new Block("A", "Some long text"),
//   new Block("B", "The B Block text"),
//   new Block("C", "Cyphering congescor"),
//   new Block("D", "Damaging dinosaurs"),
// ];

// let block_1 = new Block("A", "Some long text");
// let block_2 = new Block("B", "The B Block text");
// let block_3 = new Block("C", "Cyphering congescor");
// let block_4 = new Block("D", "Damaging dinosaurs");

export const blocks = writable([
  new Block("A", "Some long text"),
  new Block("B", "The B Block text"),
  new Block("C", "Cyphering congescor"),
  new Block("D", "Damaging dinosaurs"),
]);
