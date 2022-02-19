import fetch, { RequestInit } from 'node-fetch'
import { URL } from 'url'
import { NotionError, NotionErrorJson } from './error'
import type { RequestTemplate } from 'notion-api-types/endpoints/global'

export default request
async function request<T extends RequestTemplate>(
    args: Omit<T, 'headers'> & { token: string }
): Promise<any>
async function request(args: DirectRequest & { token: string }): Promise<any>
async function request<T extends RequestTemplate | DirectRequest>(
    args: T extends RequestTemplate
        ? Omit<T, 'headers'> & { token: string }
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
    else {
        let error: Error
        try {
            const { code, message }: NotionErrorJson = await res.json()
            let data = undefined
            if (code == 'invalid_request_url')
                data = { url: urlStr, method: args.method }
            else if (code == 'invalid_json' && 'params' in args)
                data = args.params
            error = new NotionError(code, message, data)
        } catch (err) {
            error = new Error(
                `Request failed! status: ${res.status}, statusText: ${res.statusText} `
            )
        }
        throw error
    }
}

interface DirectRequest {
    method: 'GET' | 'POST' | 'PATCH'
    url: string
}
