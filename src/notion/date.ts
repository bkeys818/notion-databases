import type { ResponsePropertyType } from './database/item'

export const datesAreEqual = (
    notionDate: ResponsePropertyType<'date'>['date'],
    canvasDate?: {
        start?: string
        end?: string
        time_zone?: string
    }) =>
    areEqual(canvasDate?.start, notionDate?.start) &&
    areEqual(canvasDate?.end, notionDate?.end) &&
    canvasDate?.time_zone == notionDate?.time_zone

const areEqual = (a?: string | null, b?: string | null) =>
    (a && b && new Date(a).toString() == new Date(b).toString()) ||
    a == b
