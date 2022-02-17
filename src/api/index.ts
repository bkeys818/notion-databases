import request from './request'
import type { Databases, Pages } from 'notion-api-types/endpoints'

export function queryDatabase(
    args: {
        token: string
        database_id: string
    } & Databases.Query.Request['params']
): Promise<Databases.Query.Response> {
    const { token, database_id, ...params } = args
    return request<Databases.Query.Request>({
        token,
        endpoint: `databases/${database_id}/query`,
        method: 'POST',
        params,
    })
}

export function createPage(
    args: {
        token: string
    } & Pages.Create.Request['params']
): Promise<Pages.Create.Response> {
    const { token, ...params } = args
    return request<Pages.Create.Request>({
        token,
        endpoint: 'pages',
        method: 'POST',
        params,
    })
}

export function updatePage(
    args: {
        token: string
        page_id: string
    } & Pages.Update.Request['params']
): Promise<Pages.Update.Response> {
    const { token, page_id, ...params } = args
    return request<Pages.Update.Request>({
        token,
        endpoint: `pages/${page_id}`,
        method: 'PATCH',
        params: params,
    })
}