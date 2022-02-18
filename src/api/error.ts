export class NotionError extends Error {
    name = 'NotionError'
    readonly isApiError: boolean = false
    constructor(
        readonly code: NotionErrorCode,
        message: string,
        readonly data?: any
    ) {
        super(message)
        if (apiErrorCodes.includes(code)) this.isApiError = true
    }
}

const apiErrorCodes: NotionErrorCode[] = [
    'database_connection_unavailable',
    'internal_server_error',
    'service_unavailable',
]

// prettier-ignore
type NotionErrorCode = 'invalid_json'| 'invalid_request_url'| 'invalid_request'| 'validation_error'| 'missing_version'| 'unauthorized'| 'restricted_resource'| 'object_not_found'| 'conflict_error'| 'rate_limited'| 'internal_server_error'| 'service_unavailable'| 'database_connection_unavailable'

export interface NotionErrorJson {
    object: 'error'
    status: number
    code: NotionErrorCode
    message: string
}
