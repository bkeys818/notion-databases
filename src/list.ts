import type { List } from 'notion-api-types/endpoints/global'

export async function getEntireList<
    A extends { start_cursor?: string },
    T,
>(method: (args: A) => Promise<List<T>>, args: A): Promise<T[]> {
    const list: T[] = []
    async function requestPage(thisCursor?: string) {
        args.start_cursor = thisCursor
        const { results, next_cursor } = await method(args)
        list.push(...results)
        if (next_cursor) await requestPage(next_cursor)
    }
    await requestPage()
    return list
}
