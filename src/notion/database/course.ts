import DatabaseItem from './item'
import * as Canvas from '../../canvas'
import { dateNeedsUpdating } from '../utils'

export default class Course extends DatabaseItem<CourseProps> {
    constructor(
        data: DatabaseItem<CourseProps>['data'],
        updatePage: DatabaseItem<any>['updatePage']
    ) {
        super(data, updatePage)
    }

    updateProps(course: Canvas.Course) {
        if (
            !this.name ||
            !this.customProps.includes('Name') 
        ) this.name = course.name

        if (
            !this.customProps.includes('Duration') &&
            course.start_at != null &&
            dateNeedsUpdating(this.duration, {
                start: course.start_at,
                end: course.end_at,
            })
        )
            this.duration = {
                start: course.start_at,
                end: course.end_at,
            }

        this.lastSynced = new Date()
    }

    get canvasUrl() {
        const { url } = this.data.properties['Canvas Url']
        return url!
    }

    private get customProps() {
        const keys = Object.keys(this.data.properties)
        return this.data.properties['Custom Props'].multi_select
            .map(obj => obj.name)
            .filter((key): key is keyof Course['data']['properties'] =>
                keys.includes(key)
            )
    }

    private get name() {
        const title = this.data.properties.Name.title
        if (title.length == 0) return null
        else return title[0].plain_text
    }
    private set name(value: string | null) {
        if (value)
            this.updatedProperties.Name = {
                title: [{ text: { content: value } }],
            }
    }

    get canvasId() {
        return Canvas.extractId(this.canvasUrl)
    }

    private get duration() {
        return this.data.properties['Duration'].date
    }
    private set duration(
        value: {
            start: string
            end: string | null
        } | null
    ) {
        this.updatedProperties['Duration'] = { date: value }
    }

    private set lastSynced(value: Date) {
        this.updatedProperties['Last Synced'] = {
            date: { start: value.toISOString() },
        }
    }

    set error(value: SyncError) {
        const errorLink = new URL(
            (process.env.NODE_ENV == 'development'
                ? `http://localhost:5001`
                : `https://notion-canvas-sync.netlify.app`) + '/error'
        )
        let key: keyof typeof value
        for (key in value) {
            const _value = value[key]
            if (_value) errorLink.searchParams.set(key, _value)
        }
        this.updatedProperties.Error = {
            rich_text: new Array({
                text: {
                    content: value.type,
                    link: { url: errorLink.href },
                },
            }),
        }
    }
}

type CourseProps = {
    Name: 'title'
    Duration: 'date'
    Sync: 'checkbox'
    'Canvas Url': 'url'
    'Last Synced': 'date'
    'Custom Props': 'multi_select'
    Error: 'rich_text'
}

interface SyncError {
    type: 'missing property'
    value?: string
}
