import { updatePage } from './api'
import type { Database } from '.'
import type { NotionRequest, NotionResponse } from 'notion-api-types'

export default class Item<P extends CustomProps> {
    readonly properties: Page<P>['properties']
    private readonly id: Page<P>['id']

    constructor(private readonly database: Database<P>, value: Page<P>) {
        this.properties = value.properties
        this.id = value.id
    }

    update(props: Partial<Properties<P>>) {
        return updatePage({
            token: this.database['token'],
            page_id: this.id,
            properties: props as Properties<P>,
        })
    }
}

export type PropertyType = NonNullable<NotionRequest.PageProperty['type']>

export type CustomProps = Record<string, PropertyType>

export type Property<T extends PropertyType = PropertyType> = T extends T
    ? Extract<NotionRequest.PageProperty, Record<T, any>>
    : never

export type Properties<T extends CustomProps> = {
    [K in keyof T]: Property<T[K]>
}

export interface Page<P extends CustomProps> extends NotionResponse.Page {
    properties: {
        [K in keyof P]: P[K] extends P[K]
            ? Extract<NotionResponse.PageProperty, Record<P[K], any>>
            : never
    }
}
