import { queryDatabase, createPage } from './api'
import { getEntireList } from './list'
import type { Item } from '.'
import type { CustomProps, Page, Properties } from './item'
import type { Filter } from 'notion-api-types/endpoints/databases/query'

export default class Database<P extends CustomProps> {
    constructor(
        private readonly item: new (
            databse: Database<P>,
            value: Page<P>
        ) => Item<P>,
        private readonly token: string,
        private readonly id: string,
        private readonly filter?: Filter
    ) {}

    readonly items = getEntireList(queryDatabase, {
        token: this.token,
        database_id: this.id,
        filter: this.filter,
        page_size: 100,
    }).then(pages => pages.map(page => new this.item(this, page as Page<P>)))

    newItem(properties: Partial<Properties<P>>) {
        return createPage({
            token: this.token,
            parent: { database_id: this.id },
            properties: properties as Properties<P>,
        })
    }
}
