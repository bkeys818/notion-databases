import DatabaseItem, { SimpleProps, PageProperties } from './item'
import { ExtendsDatabaseItem } from '.'
import type * as Canvas from '../../canvas'
import { datesAreEqual } from '../date'

export default class Assignment extends DatabaseItem<
    AssignmentProps,
    Canvas.Assignment
> {
    constructor(...[data, updatePage]: ExtendsDatabaseItem<AssignmentProps>) {
        super(data, updatePage, assignment => {
            const props: SimpleProps<AssignmentProps> = {}
            if (this.title != assignment.name)
                props.Title = [{ text: { content: assignment.name } }]

            if (
                datesAreEqual(this.dueDate, {
                    start: assignment.due_at ?? undefined,
                })
            )
                props['Due Date'] = assignment.due_at
                    ? { start: assignment.due_at, end: null, time_zone: null }
                    : null

            if (
                this.complete === false &&
                assignment.has_submitted_submissions === true
            )
                props.Complete = true

            return props
        })
    }

    static convertProps = (
        assignment: Canvas.Assignment,
        institution: string,
        courseId: string
    ) => ({
        Title: { title: [{ text: { content: assignment.name } }] },
        'Canvas Id': {
            rich_text: [
                { text: { content: [institution, assignment.id].join('/') } },
            ],
        },
        'Due Date': assignment.due_at
            ? { date: { start: assignment.due_at } }
            : undefined,
        Complete: { checkbox: assignment.has_submitted_submissions },
        Course: { relation: [{ id: courseId }] },
    }) as PageProperties<AssignmentProps>

    private readonly title = (() => {
        const title = this.getValue('Title')
        if (title.length == 0) return null
        else return title[0].plain_text
    })()
    readonly canvasId = (() => {
        const id = this.getValue('Canvas Id')
        if (id.length == 0) return null
        else return id[0].plain_text
    })()
    private readonly dueDate = this.getValue('Due Date')
    private readonly complete = this.getValue('Complete')
}

type AssignmentProps = {
    Title: 'title'
    'Canvas Id': 'rich_text'
    'Due Date': 'date'
    Complete: 'checkbox'
    Course: 'relation'
    Type: 'multi_select'
}
