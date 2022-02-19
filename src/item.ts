import { updatePage } from './api'
import type { NotionRequest, NotionResponse } from 'notion-api-types'

export default class Item<P extends CustomProps> {
    #props: Page<P>['properties']
    protected get properties() {
        return this.#props
    }
    private set properties(value: Page<P>['properties']) {
        this.#props = value
    }
    private readonly id: Page<P>['id']

    constructor(private readonly token: string, value: Page<P>) {
        this.#props = value.properties
        this.id = value.id
    }

    async update(properties: Partial<Properties<P>>) {
        const page = await updatePage({
            token: this.token,
            page_id: this.id,
            properties,
        })
        this.properties = page.properties as Page<P>['properties']
        return page
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
