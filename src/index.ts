import { Client } from '@notionhq/client'
import { getEntireList } from '../list'
import type DatabaseItem from './item'
import type { CustomProps, Page, PageProperties } from './item'

import Course from './course'
import Assignment from './assignment'
export { Course, Assignment }

export default class Database<
    P extends CustomProps,
    T extends DatabaseItem<P>,
    CP extends ((...args: any[]) => PageProperties<P>) | undefined = undefined
> {
    constructor(
        private readonly itemClass: DatabaseItemClass<P, T, CP>,
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
                item =>
                    new this.itemClass(
                        item as Page<P>,
                        this.client.pages.update
                    )
            )
        )
    })

    readonly newItem = (this.itemClass.convertProps
        ? (...args: Parameters<Exclude<CP, undefined>>) =>
              this.client.pages.create({
                  parent: { database_id: this.id },
                  properties: this.itemClass.convertProps!(...args),
              })
        : undefined) as CP extends undefined
        ? undefined
        : (
              ...args: Parameters<Exclude<CP, undefined>>
          ) => ReturnType<Client['pages']['create']>
}

interface DatabaseItemClass<
    P extends CustomProps,
    T extends DatabaseItem<P>,
    CP extends ((...args: any[]) => PageProperties<P>) | undefined
> {
    new (...args: ExtendsDatabaseItem<P>): T
    convertProps?: CP
}

export type ExtendsDatabaseItem<P extends CustomProps> = [
    data: DatabaseItem<P>['data'],
    newItem: DatabaseItem<P>['updatePage']
]
