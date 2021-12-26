import type { Client } from '@notionhq/client'
import type {
    QueryDatabaseResponse,
    UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints'

export class Item<P extends CustomProps> {
    readonly properties: Page<P>['properties']
    private readonly id: Page<P>['id']
    protected readonly updatePage: Client['pages']['update']

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

type _Page = Extract<
    Exclude<QueryDatabaseResponse, { rollup: any }>['results'][number],
    { parent: any }
>

type AllProperties = Extract<
    UpdatePageParameters['properties'],
    Record<string, { type?: string; [k: string]: any }>
>[string]

// type ResponsePropertyType = _Page['properties'][string]['type']
export type PropertyType = NonNullable<AllProperties['type']>

export type CustomProps = Record<string, PropertyType>

export type Property<T extends PropertyType> = T extends T
    ? Extract<AllProperties, Record<T, any>>
    : never

export type Properties<T extends CustomProps> = {
    [K in keyof T]: Property<T[K]>
}

type PropertyResponse<T extends PropertyType> = Extract<
    _Page['properties'][string],
    Record<T, any>
>

export interface Page<T extends CustomProps> extends _Page {
    properties: { [K in keyof T]: PropertyResponse<T[K]> }
}
