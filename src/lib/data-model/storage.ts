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

	deleteBlock(block: Block) {
		return this.db.delete<SerializedBlock>(block.recordId);
	}

	//

	saveLink(link: Link) {
		return this.db.create<SerializedLink>(link.recordId, link.serialize());
	}

	updateLink(link: Link) {
		return this.db.update<SerializedLink>(link.recordId, link.serialize());
	}

	deleteLink(link: Link) {
		return this.db.delete<SerializedLink>(link.recordId);
	}

	//

	close() {
		this.db.close();
	}
}
