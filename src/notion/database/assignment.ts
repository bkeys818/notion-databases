import DatabaseItem from './item'
import type * as Canvas from '../../canvas'
import { dateNeedsUpdating } from '../date'

export default class Assignment extends DatabaseItem<AssignmentProps> {
    constructor(
        data: DatabaseItem<AssignmentProps>['data'],
        updatePage: DatabaseItem<any>['updatePage']
    ) {
        super(data, updatePage)
    }

    static convertProps = (
        assignment: Canvas.Assignment,
        institution: string,
        courseId: string
    ): Assignment['updatedProperties'] => ({
        Title: { title: [{ text: { content: assignment.name } }] },
        'Canvas Id': { rich_text: [{ text: { content: [institution, assignment.id].join('/') } }] },
        'Due Date': assignment.due_at
            ? { date: { start: assignment.due_at } }
            : undefined,
        Complete: { checkbox: assignment.has_submitted_submissions },
        Course: { relation: [{ id: courseId }] },
    })

    updateProps(assignment: Canvas.Assignment) {
        if (this.title != assignment.name) this.title = assignment.name

        if (dateNeedsUpdating(this.dueDate, { start: assignment.due_at }))
            this.dueDate = assignment.due_at
                ? { start: assignment.due_at, end: null }
                : null

        if (
            this.complete === false &&
            assignment.has_submitted_submissions === true
        )
            this.complete = true
    }

    private get title() {
        const title = this.data.properties.Title.title
        if (title.length == 0) return null
        else return title[0].plain_text
    }
    private set title(value: string | null) {
        if (value)
            this.updatedProperties.Title = {
                title: [{ text: { content: value } }],
            }
    }

    get canvasId() {
        const title = this.data.properties['Canvas Id'].rich_text
        if (title.length == 0) return null
        else return title[0].plain_text
    }
    setCanvasId(value: Canvas.ItemId) {
        if (value)
            this.updatedProperties['Canvas Id'] = {
                rich_text: new Array({ text: { content: value.join('/') } }),
            }
    }

    private get dueDate() {
        return this.data.properties['Due Date'].date
    }
    private set dueDate(
        value: {
            start: string
            end: string | null
        } | null
    ) {
        this.updatedProperties['Due Date'] = { date: value }
    }

    private get complete() {
        return this.data.properties.Complete.checkbox
    }
    private set complete(value: boolean) {
        this.updatedProperties.Complete = { checkbox: value }
    }
}

type AssignmentProps = {
    Title: 'title'
    'Canvas Id': 'rich_text'
    'Due Date': 'date'
    Complete: 'checkbox'
    Course: 'relation'
    Type: 'multi_select'
}
