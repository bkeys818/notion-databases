import sendRequest from './send-request'
import { getEntireList } from './list'
import type { UserData } from '../'

export default class CanvasClient {
    private readonly tokens: Record<string, string> = {}
    constructor(tokens: UserData['canvasTokens']) {
        for (const { institution, token } of tokens) {
            this.tokens[institution] = token
        }
    }

    private request = sendRequest
    private getEntireList = getEntireList.bind(this)

    readonly courses: Record<string, Course> = {}
    readonly assignments: Record<string, Assignment[]> = {}

    getDataForCourses = (ids: ItemId[]) =>
        Promise.all(
            ids.map(id => {
                const idStr = id.join('/')
                return Promise.all([
                    this.getCourse(id).then(
                        course => (this.courses[idStr] = course)
                    ),
                    this.getAssignments(id).then(
                        assignment => (this.assignments[idStr] = assignment)
                    ),
                ])
            })
        )

    getCourse = (courseId: ItemId): Promise<Course> =>
        this.request({
            institution: courseId[0],
            path: `courses/${courseId[1]}`,
        }).then(res => res.json())
    getAssignments = (courseId: ItemId): Promise<Assignment[]> =>
        this.request({
            institution: courseId[0],
            path: `courses/${courseId[1]}/assignments`,
        }).then(this.getEntireList)
}

export interface Course {
    id: number
    name: string
    uuid: string
    start_at: string | null
    end_at: string | null
    original_name: string
    // friendly_name: null
    enrollment_term_id: number
    course_code: string // undefined?
}

export interface Assignment {
    id: number
    description: string
    due_at: string | null
    // unlock_at: null,
    // lock_at: null,
    // points_possible: 25,
    // grading_type: 'points',
    // assignment_group_id: 193963,
    // grading_standard_id: null,
    // peer_reviews: false,
    // automatic_peer_reviews: false,
    // position: 1,
    // grade_group_students_individually: false,
    // anonymous_peer_reviews: false,
    // group_category_id: null,
    // post_to_sis: false,
    // moderated_grading: false,
    // omit_from_final_grade: false,
    // intra_group_peer_reviews: false,
    // anonymous_instructor_annotations: false,
    // anonymous_grading: false,
    // graders_anonymous_to_graders: false,
    // grader_count: 0,
    // grader_comments_visible_to_graders: true,
    // final_grader_id: null,
    // grader_names_visible_to_final_grader: true,
    // allowed_attempts: -1,
    // annotatable_attachment_id: null,
    // secure_params: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6IjBkMDFhZjhlLWYwYmUtNGFhOC05YWExLWE3M2VjYTA1M2ZlMCIsImx0aV9hc3NpZ25tZW50X2Rlc2NyaXB0aW9uIjoiXHUwMDNjcFx1MDAzZVdobyBhcmUgeW91PyBPbiBDYW52YXMsIGluIDUwMC04MDAgd29yZHMsIGludHJvZHVjZSB5b3Vyc2VsZiB0byB0aGUgY2xhc3MuIFlvdSBkb27igJl0IGhhdmUgdG8gdGVsbCB5b3VyIGxpZmUgc3RvcnkgdG8gdGhlc2UgcGVvcGxlLCBidXQgc2hhcmUgc29tZSB0aGluZ3MgYWJvdXQgeW91cnNlbGYgdGhhdCBjb3VsZCBiZSBiZW5lZmljaWFsIGZvciB1cyB0byBrbm93LiBEbyB5b3UgaGF2ZSBhbnkgcGV0cyB0aGF0IHlvdSBhYnNvbHV0ZWx5IGFkb3JlPyBXaGF0IGlzIHlvdXIgZmF2b3JpdGUgdGhpbmcgdG8gZWF0LCB0aGVuIHRlbGwgdXMgd2h5IHlvdSBsb3ZlIHRoYXQgZm9vZC4gV2hhdCBpcyBzb21ldGhpbmcgeW91IGxvdmUgdG8gZG8gYXQgeW91ciBob21ldG93biBvciBoZXJlIGluIE11bmNpZT8gSWYgeW91IHJ1biBvdXQgb2YgdGhpbmdzIHRvIHNheSBhYm91dCB5b3Vyc2VsZiwgdGhpbmsgb2YgYSBzdG9yeSB5b3UgbG92ZSB0byBzaGFyZSBhYm91dCB5b3Vyc2VsZiB0byBmaWxsIHVwIHlvdXIgc3BhY2UuXHUwMDNjL3BcdTAwM2UifQ.sOvCyfPLRRVZdKJptOxJRpmUXcZp5cLHtlLAvpF9D60',
    course_id: number
    name: string
    submission_types: (
        | 'discussion_topic'
        | 'online_quiz'
        | 'on_paper'
        | 'none'
        | 'external_tool'
        | 'online_text_entry'
        | 'online_url'
        | 'online_upload'
    )[]
    has_submitted_submissions: boolean
    due_date_required: boolean
    // max_name_length: 255,
    // in_closed_grading_period: false,
    // is_quiz_assignment: false,
    // can_duplicate: true,
    // original_course_id: null,
    // original_assignment_id: null,
    // original_assignment_name: null,
    // original_quiz_id: null,
    // workflow_state: 'published',
    // important_dates: false,
    // muted: true,
    html_url: string
    // published: true,
    // only_visible_to_overrides: false,
    locked_for_user: boolean
    // submissions_download_url: 'https://bsu.instructure.com/courses/115689/assignments/1001340/submissions?zip=1',
    // post_manually: false,
    // anonymize_students: false,
    require_lockdown_browser: boolean
}

// interface discussionTopic {
//       assignment_id: 1001340,
//       id: 678259,
//       root_topic_id: null,
//       delayed_post_at: null,
//       lock_at: null,
//       title: 'Writing: Introductions',
//       last_reply_at: '2021-08-28T02:34:28Z',
//       created_at: '2021-08-20T19:18:52Z',
//       posted_at: '2021-08-20T20:59:14Z',
//       position: null,
//       podcast_has_student_posts: false,
//       discussion_type: 'side_comment',
//       allow_rating: false,
//       only_graders_can_rate: false,
//       sort_by_rating: false,
//       is_section_specific: false,
//       user_name: 'Cassidy Forbing',
//       discussion_subentry_count: 27,
//       permissions: [Object],
//       require_initial_post: true,
//       user_can_see_posts: true,
//       podcast_url: null,
//       read_state: 'read',
//       unread_count: 20,
//       subscribed: true,
//       attachments: [],
//       published: true,
//       can_unpublish: false,
//       locked: false,
//       can_lock: true,
//       comments_disabled: false,
//       author: [Object],
//       html_url: 'https://bsu.instructure.com/courses/115689/discussion_topics/678259',
//       url: 'https://bsu.instructure.com/courses/115689/discussion_topics/678259',
//       pinned: false,
//       group_category_id: null,
//       can_group: false,
//       topic_children: [],
//       group_topic_children: [],
//       locked_for_user: false,
//       message: '<p>Who are you? On Canvas, in 500-800 words, introduce yourself to the class. You don’t have to tell your life story to these people, but share some things about yourself that could be beneficial for us to know. Do you have any pets that you absolutely adore? What is your favorite thing to eat, then tell us why you love that food. What is something you love to do at your hometown or here in Muncie? If you run out of things to say about yourself, think of a story you love to share about yourself to fill up your space.</p>',
//       todo_date: null
// }

export function extractId(urlStr: string): ItemId {
    const url = new URL(urlStr)
    const institution = url.hostname.slice(0,url.hostname.indexOf('.'))
    for (const step of url.pathname.split('/').reverse()) {
        if (/\d+/.test(step)) return [institution, parseInt(step)]
    }
    throw new Error('Invalid URL')
}
export type ItemId = [string, number]
