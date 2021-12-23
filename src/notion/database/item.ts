import type { Client } from '@notionhq/client'
import type {
    QueryDatabaseResponse,
    UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints'

export default class DatabaseItem<P extends CustomProps, D = any> {
    constructor(
        private readonly data: Page<P>,
        private updatePage: Client['pages']['update'],
        private updateProps: (data: D) => SimpleProps<P>
    ) {}

    readonly id = this.data.id

    protected getValue<K extends keyof P>(name: K) {
        const prop = this.data.properties[name]
        return prop[prop.type as P[K]]
    }

    private formatProps(value: SimpleProps<P>) {
        const response = {} as PageProperties<P>
        let key: keyof P
        for (key in value) {
            const { type } = this.data.properties[key]
            response[key] = { [type]: value[key] } as RequestPropertyType<
                P[keyof P]
            >
        }
        return response
    }

    updateWith(data: D) {
        const props = this.formatProps(this.updateProps(data))
        if (Object.keys(props).length > 0)
            return this.updatePage({ page_id: this.id, properties: props })
    }

    protected readonly updateProp = <K extends keyof P>(
        name: K,
        value: RequestPropertyType<P[K]>[P[K]]
    ) =>
        this.updatePage({
            page_id: this.id,
            properties: {
                [name]: {
                    [this.data.properties[name].type as P[K]]: value,
                } as any,
            },
        })
}

export type SimpleProps<P extends CustomProps> = {
    [K in keyof P]?: RequestPropertyType<P[K]>[P[K]]
}

type _Page = Extract<
    Exclude<QueryDatabaseResponse, { rollup: any }>['results'][number],
    { parent: any }
>

type PropertyTypeName = _Page['properties'][string]['type']

export type CustomProps = Record<string, PropertyTypeName>

type Property = Extract<
    Extract<UpdatePageParameters['properties'], Record<string, any>>[string],
    { type?: any }
>

export type RequestPropertyType<T extends PropertyTypeName> = Extract<
    Property,
    Record<T, any>
>

export type PageProperties<P extends CustomProps> = {
    [key in keyof P]: RequestPropertyType<P[key]>
}

export type ResponsePropertyType<T extends PropertyTypeName> = Extract<
    _Page['properties'][string],
    Record<T, any>
>

export interface Page<T extends CustomProps> extends _Page {
    properties: {
        [key in keyof T]: ResponsePropertyType<T[key]>
    }
}
