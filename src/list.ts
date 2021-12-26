export function getEntireList<
    A extends {},
    R extends List<any>,
    T extends R['results'][number]
>(
    args: {
        method: (args: A) => Promise<R>
    } & A
): Promise<T[]> {
    return loop()
    async function loop(next_cursor?: string | null) {
        const { method, ...params } = args
        // @ts-ignore
        params.next_cursor = next_cursor
        const response = await method(params as unknown as A)
        const list = response.results as T[]
        if (next_cursor && response.has_more)
            list.push(...(await loop(response.next_cursor)))
        return list
    }
}

export interface List<T> {
    object: 'list'
    next_cursor: string | null
    has_more: boolean
    results: Array<T>
}
