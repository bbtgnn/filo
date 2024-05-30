export class Block {
  id: string;
  text: string;
  items_bottom: Array<Block>;
  items_left: Array<Block>;
  items_right: Array<Block>;

  constructor(id: string, text: string) {
    this.id = id;
    this.text = text;

    this.items_bottom = [];
    this.items_left = [];
    this.items_right = [];
  }

  split(index: number): Array<Block> {
    // Array will store the new blocks
    const newBlocks: Array<Block> = [];
    // We get the splitted text
    const parts = [this.text.substring(0, index), this.text.substring(index)];
    // Then for each part we create a block
    parts.forEach((part, index) => {
      newBlocks.push(new Block(this.id + index, part));
    });
    return newBlocks;
  }
}
