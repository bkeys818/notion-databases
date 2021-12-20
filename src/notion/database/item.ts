import type { Client } from '@notionhq/client'
import type {
    QueryDatabaseResponse,
    UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints'

export default class DatabaseItem<T extends CustomPage> {
    constructor(
        protected readonly data: Page<T>,
        private updatePage: Client['pages']['update']
    ) {}

    get id() {
        return this.data.id
    }

    updatedProperties: Partial<PageProperties<T>> = {}

    update = () =>
        Object.keys(this.updatedProperties).length > 0
            ? this.updatePage({
                  page_id: this.id,
                  properties: this.updatedProperties as PageProperties<T>,
              })
            : undefined
}

type _Page = Extract<Exclude<QueryDatabaseResponse, { rollup: any }>['results'][number], { parent: any }>

type PropertyTypeName = _Page['properties'][string]['type']

export type CustomPage = Record<string, PropertyTypeName>

type Property = Extract<
    Extract<UpdatePageParameters['properties'], Record<string, any>>[string],
    { type?: any }
>

type RequestPropertyType<T extends PropertyTypeName> = Extract<
    Property,
    Record<T, any>
>

export type PageProperties<P extends CustomPage> = {
    [key in keyof P]: RequestPropertyType<P[key]>
}

export type ResponsePropertyType<T extends PropertyTypeName> = Extract<
    _Page['properties'][string],
    Record<T, any>
>

export interface Page<T extends CustomPage> extends _Page {
    properties: {
        [key in keyof T]: ResponsePropertyType<T[key]>
    }
}