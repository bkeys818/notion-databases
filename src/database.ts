import { queryDatabase, createPage } from './api'
import { getEntireList } from './list'
import type { Item } from '.'
import type { CustomProps, Page, Properties } from './item'
import type { Filter } from 'notion-api-types/endpoints/databases/query'

export default class Database<T extends Item<P>, P extends CustomProps> {
    constructor(
        private readonly item: ItemClass<T, P>,
        private readonly token: string,
        private readonly id: string,
        private readonly filter?: Filter
    ) {}

    readonly items = getEntireList(queryDatabase, {
        token: this.token,
        database_id: this.id,
        filter: this.filter,
        page_size: 100,
    }).then(pages =>
        pages.map(page => new this.item(this.token, page as Page<P>))
    )

    async newItem(properties: Partial<Properties<P>>) {
        const page = await createPage({
            token: this.token,
            parent: { database_id: this.id },
            properties,
        })
        const item = new this.item(this.token, page as Page<P>)
        ;(await this.items).push(item)
        return item
    }
}

type ItemClass<T extends Item<P>, P extends CustomProps> = new (
    token: string,
    value: Page<P>
) => T
