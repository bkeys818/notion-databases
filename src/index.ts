import { getEntireList } from './list'
import type { Client } from '@notionhq/client'
import type { Item, CustomProps, ItemParams, Page, Properties } from './item'
export { Item } from './item'
export type { CustomProps, Page, Properties }
export type { Property, PropertyType } from './item'

export class Database<P extends CustomProps, T extends Item<P>> {
    constructor(
        private readonly item: new (...args: ItemParams<P>) => T,
        private readonly client: Client,
        private readonly id: string,
        private readonly filter?: Parameters<
            Client['databases']['query']
        >[0]['filter']
    ) {}

    readonly items: T[] = []

    readonly getItemsPromise = getEntireList({
        method: this.client.databases.query,
        database_id: this.id,
        page_size: 100,
        filter: this.filter,
    }).then(list => {
        this.items.push(
            ...list.map(
                item => new this.item(item as Page<P>, this.client.pages.update)
            )
        )
    })

    newItem(properties: Partial<Properties<P>>) {
        return this.client.pages.create({
            parent: { database_id: this.id },
            properties: properties as Properties<P>,
        })
    }
}
