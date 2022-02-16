import NotionClient from './request' 
import type { NotionRequest, NotionResponse } from 'notion-api-types'

export class Item<P extends CustomProps> {
    readonly properties: Page<P>['properties']
    private readonly id: Page<P>['id']
    protected readonly updatePage: NotionClient['pages']['update']

    constructor(...[value, updatePage]: ItemParams<P>) {
        this.properties = value.properties
        this.id = value.id
        this.updatePage = updatePage
    }

    // getProp<K extends keyof P>(name: K) {
    //     const value = this.properties[name]
    //     return value[value.type as P[K]]
    // }

    update(props: Partial<Properties<P>>) {
        return this.updatePage({
            page_id: this.id,
            properties: props as Properties<P>
        })
    }
}

export type ItemParams<P extends CustomProps> = [
    data: Page<P>,
    updatePage: Item<P>['updatePage']
]

export type PropertyType = NonNullable<NotionRequest.PageProperty['type']>

export type CustomProps = Record<string, PropertyType>

export type Property<T extends PropertyType> = T extends T
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
