import type { ResponsePropertyType } from '../database/item'

export const dateNeedsUpdating = (
    notionDate: ResponsePropertyType<'date'>['date'] | null,
    canvasDate: {
        start: string | null
        end?: string | null
    }
) =>
    (notionDate === null &&
        canvasDate.start === null &&
        (canvasDate.end === undefined || canvasDate.end === null)) ||
    (notionDate &&
        canvasDate.start &&
        datesAreEqual(notionDate.start, canvasDate.start) &&
        ((notionDate.end === null &&
            (canvasDate.end === null || canvasDate.end === undefined)) ||
            (notionDate.end &&
                canvasDate.end &&
                datesAreEqual(notionDate.end, canvasDate.end))))
        ? false
        : true

const datesAreEqual = (a: string, b: string) =>
    new Date(a).toString() == new Date(b).toString()