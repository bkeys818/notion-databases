import fetch, { RequestInit } from 'node-fetch'
import { URL } from 'url'
import type { Endpoints } from 'notion-api-types'
import type { RequestTemplate } from 'notion-api-types/endpoints/global'

export default class NotionClient {
    constructor(private readonly token: string) {}
    private readonly request = request

    readonly database = {
        query: (
            params: {
                database_id: string
            } & Endpoints.Databases.Query.Request['params']
        ): Promise<Endpoints.Databases.Query.Response> =>
            this.request<Endpoints.Databases.Query.Request>({
                endpoint: `databases/${params.database_id}/query`,
                method: 'POST',
                params: params,
            }),
    }

    readonly pages = {
        create: (
            params: Endpoints.Pages.Create.Request['params']
        ): Promise<Endpoints.Pages.Create.Response> =>
            this.request<Endpoints.Pages.Create.Request>({
                endpoint: 'pages',
                method: 'POST',
                params: params,
            }),
        update: (
            params: {
                page_id: string
            } & Endpoints.Pages.Update.Request['params']
        ): Promise<Endpoints.Pages.Update.Response> =>
            this.request<Endpoints.Pages.Update.Request>({
                endpoint: `pages/${params.page_id}`,
                method: 'PATCH',
                params: params,
            }),
    }
}

async function request<T extends RequestTemplate>(
    this: NotionClient,
    args: Omit<T, 'headers'> & { params?: any }
): Promise<any>
async function request(this: NotionClient, args: DirectRequest): Promise<any>
async function request<T extends RequestTemplate | DirectRequest>(
    this: NotionClient,
    args: T extends RequestTemplate ? Omit<T, 'headers'> & { params?: any } : T
) {
    const init: RequestInit = {
        method: args.method,
        headers: {
            'Notion-Version': '2021-08-16',
            Authorization: `Bearer ${this['token']}`,
        },
    }

    let urlStr: string
    if ('url' in args) urlStr = args.url
    else {
        const url = new URL('https://api.notion.com/v1' + args.endpoint)
        if (args.method == 'GET')
            for (const key in args.params)
                url.searchParams.set(key, args.params[key].toString())
        else init.body = JSON.stringify(args.params)
        urlStr = url.href
    }

    const res = await fetch(urlStr, init)

    if (res.ok) return await res.json()
    else throw (await res.json()) as NotionError
}

interface DirectRequest {
    method: 'GET' | 'POST' | 'PATCH'
    url: string
}

export interface NotionError {
    object: 'error'
    status: number
    code:
        | 'invalid_json'
        | 'invalid_request_url'
        | 'invalid_request'
        | 'validation_error'
        | 'missing_version'
        | 'unauthorized'
        | 'restricted_resource'
        | 'object_not_found'
        | 'conflict_error'
        | 'rate_limited'
        | 'internal_server_error'
        | 'service_unavailable'
        | 'database_connection_unavailable'
    message: string
}
