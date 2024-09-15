import type Surreal from 'surrealdb';
import { Block, type SerializedBlock } from './block.svelte';
import type { Link, SerializedLink } from './link.svelte';

export class Storage {
	constructor(public db: Surreal) {}

	// TODO - Dry properly

	saveBlock(block: Block) {
		return this.db.create<SerializedBlock>(block.recordId, block.serialize());
	}

	updateBlock(block: Block) {
		return this.db.update<SerializedBlock>(block.recordId, block.serialize());
	}

	saveLink(link: Link) {
		return this.db.create<SerializedLink>(link.recordId, link.serialize());
	}

	updateLink(link: Link) {
		return this.db.update<SerializedLink>(link.recordId, link.serialize());
	}

	// export function createBlock(db: Surreal, id: string, data: BlockIn) {
	// 	return db.create<BlockIn>(new RecordId(BlockId, id), data);
	// }

	// export function getBlocks(db: Surreal) {
	// 	return db.select<Block>(BlockId);
	// }

	close() {
		this.db.close();
	}
}
