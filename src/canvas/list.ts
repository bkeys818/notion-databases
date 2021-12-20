import type CanvasClient from '.'
import type { Response } from 'node-fetch'
import { URL } from 'url'
import { createError } from './error'

export async function getEntireList(this: CanvasClient, response: Response) {
    const list: any[] = await response.json()
    const linksStr = response.headers.get('link')
    if (!linksStr) throw new Error(`No header with key "link"`)
    const lastPageIndex = getLastPageIndex(linksStr)
    if (!lastPageIndex)
        throw new Error(`Couldn't get last page index from "link" in header`)

    for (let i = 2; i <= lastPageIndex; i++) {
        const url = new URL(response.url)
        url.searchParams.set('page', lastPageIndex.toString())
        const newResponse = await this['request']({ url: url.href })
        if (newResponse.ok) {
            const newItems: any[] = await newResponse.json()
            list.push(...newItems)
        } else throw await createError(newResponse)
    }
    return list
}

function getLastPageIndex(linksStr: string) {
    for (const line of linksStr.split(',')) {
        let [urlStr, rel] = line.split(';')
        urlStr = urlStr.slice(1, -1) // `<...>`
        if (rel == ' rel="last"') {
            const url = new URL(urlStr)
            const pageStr = url.searchParams.get('page')
            if (pageStr) {
                return parseInt(pageStr)
            }
        }
    }
    throw new Error(`Couldn't find index of last page`)
}