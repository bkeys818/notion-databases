import CanvasClient, * as Canvas from '.'
import fetch, { RequestInit } from 'node-fetch'
import { URL } from 'url'

export default async function sendRequest(
    this: CanvasClient,
    params: CustomRequestParams | DirectRequestParams
) {
    let institution: string
    let urlString: string
    if ('path' in params) {
        institution = params.institution
        const url = new URL(
            `https://${institution}.instructure.com/api/v1/${params.path}`
        )
        const setParam = (key: string, value: boolean | string | number) =>
            url.searchParams.append(key, value.toString())
        for (const key in params.query) {
            const value = params.query[key]
            if (Array.isArray(value))
                value.forEach((item: any) => setParam(key, item))
            else setParam(key, value)
        }
        urlString = url.href
    } else {
        institution = Canvas.extractId(params.url)[0]
        urlString = params.url
    }
    const init: RequestInit = {
        headers: {
            Authorization: 'Bearer ' + this['tokens'][institution],
            'Content-Type': 'application/json',
        },
    }
    if (params.method) init.method = params.method
    const response = await fetch(urlString, init)
    if (response.ok) return response
    else {
        console.error(response)
        throw new Error(response.statusText)
    }
}

type UrlParamValue = boolean | string | number | boolean[] | string[] | number[]

interface RequestParams {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

interface CustomRequestParams extends RequestParams {
    institution: Canvas.ItemId[0]
    path: string
    query?: Record<string, UrlParamValue>
}

interface DirectRequestParams extends RequestParams {
    url: string
}
