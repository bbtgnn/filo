import { splitParagraph } from "../functions/splitParagraph";

export class Block {
  id: string;
  text: string;

  constructor(id: string, text: string) {
    this.id = id;
    this.text = text;
  }

  split(text: string): Array<Block> {
    try {
      // Array will store the new blocks
      const newBlocks: Array<Block> = [];
      // We get the splitted text
      const parts = splitParagraph(this.text, text);
      // Then for each part we create a block
      parts.forEach((part, index) => {
        newBlocks.push(new Block(this.id + index, part));
      });
      return newBlocks;
    } catch (e) {
      // If fails we return the block
      return [this];
    }
  }
}
