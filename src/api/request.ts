import fetch, { RequestInit } from 'node-fetch'
import { URL } from 'url'
import type { RequestTemplate } from 'notion-api-types/endpoints/global'

export default request
async function request<T extends RequestTemplate>(
    args: Omit<T, 'headers'> & { token: string }
): Promise<any>
async function request(args: DirectRequest & { token: string }): Promise<any>
async function request<T extends RequestTemplate | DirectRequest>(
    args: T extends RequestTemplate
        ? Omit<T, 'headers'> & { params?: any; token: string }
        : T & { token: string }
) {
    const init: RequestInit = {
        method: args.method,
        headers: {
            'Notion-Version': '2021-08-16',
            Authorization: `Bearer ${args.token}`,
            'Content-Type': 'application/json',
        },
    }

    let urlStr: string
    if ('url' in args) urlStr = args.url
    else {
        const url = new URL('https://api.notion.com/v1/' + args.endpoint)
        if ('params' in args)
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
