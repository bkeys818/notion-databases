import { getEntireList } from './list'
import type { Item, NotionClient } from '.'
import type { CustomProps, ItemParams, Page, Properties } from './item'
import type { Filter } from 'notion-api-types/endpoints/databases/query'

export default class Database<P extends CustomProps, T extends Item<P>> {
    constructor(
        private readonly item: new (...args: ItemParams<P>) => T,
        private readonly client: NotionClient,
        private readonly id: string,
        private readonly filter?: Filter
    ) {}

    readonly items = getEntireList(this.client.database.query, {
        database_id: this.id,
        page_size: 100,
        filter: this.filter,
    }).then(pages => pages.map((page) => 
        new this.item(page as Page<P>, this.client.pages.update)
    ))

    newItem(properties: Partial<Properties<P>>) {
        return this.client.pages.create({
            parent: { database_id: this.id },
            properties: properties as Properties<P>,
        })
    }
}
