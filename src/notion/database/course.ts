import DatabaseItem, { SimpleProps, RequestPropertyType } from './item'
import * as Canvas from '../../canvas'
import { datesAreEqual } from '../date'

export default class Course extends DatabaseItem<CourseProps, Canvas.Course> {
    constructor(data: Course['data'], updatePage: Course['updatePage']) {
        super(data, updatePage, course => {
            const props: SimpleProps<CourseProps> = {}

            if (!this.name || !this.customProps.includes('Name'))
                props.Name = [{ text: { content: course.name } }]

            if (
                !this.customProps.includes('Duration') &&
                course.start_at != null &&
                datesAreEqual(this.duration, {
                    start: course.start_at,
                    end: course.end_at ?? undefined,
                })
            )
                props.Duration = {
                    start: course.start_at,
                    end: course.end_at,
                    time_zone: null,
                }

            props['Last Synced'] = { start: new Date().toISOString() }

            return props
        })
    }

    // static convertProps = (
    //     course: Canvas.Course,
    //     institution: string,
    //     courseId: string
    // ) => ({
    //     Name: 
    // }) as PageProperties<CourseProps>

    readonly canvasUrl = this.getValue('Canvas Url')!
    readonly customProps = (() => {
        const keys = Object.keys(this['data'].properties)
        return this.getValue('Custom Props')
            .map(obj => obj.name)
            .filter((key): key is keyof Course['data']['properties'] =>
                keys.includes(key)
            )
    })()
    private readonly name = (() => {
        const name = this.getValue('Name')
        if (name.length == 0) return null
        else return name[0].plain_text
    })()
    readonly canvasId = Canvas.extractId(this.canvasUrl)
    private readonly duration = this.getValue('Duration')

    #error?: RequestPropertyType<'rich_text'>['rich_text']
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
        this.#error = new Array({
            text: {
                content: value.type,
                link: { url: errorLink.href },
            },
        })
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
