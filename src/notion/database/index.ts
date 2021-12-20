import { Client } from '@notionhq/client'
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import { getEntireList } from '../list'
import type DatabaseItem from './item'
import type { Page } from './item'

import Course from './course'
import Assignment from './assignment'
export { Course, Assignment }

export default class Database<T extends Course | Assignment> {
    constructor(
        private readonly item: DatabaseItemClass<T>,
        private readonly client: Client,
        private readonly id: string,
        private readonly filter?: QueryDatabaseParameters['filter']
    ) {}

    items: T[] = []

    getItemsPromise = getEntireList({
        method: this.client.databases.query,
        database_id: this.id,
        page_size: 100,
        filter: this.filter,
    }).then(list => {
        this.items = (list as Page<ExtractGeneric<T>>[]).map(
            item => new this.item(item, this.client.pages.update)
        )
    })

    newItem = (props: T['updatedProperties']) => this.client.pages.create({
        parent: { database_id: this.id },
        properties: props as any
    })
}

type ExtractGeneric<T> = T extends DatabaseItem<infer G> ? G : never
type DatabaseItemClass<T extends DatabaseItem<any>> = {
    new(
        data: DatabaseItem<ExtractGeneric<T>>['data'],
        newItem: Client['pages']['update']
    ): T
}
