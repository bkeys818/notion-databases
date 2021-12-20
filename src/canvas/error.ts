import { Response } from 'node-fetch'

export async function createError(response: Response): Promise<Error> {
    let msg: string
    try {
        const errObj: ErrorResponse = await response.json()
        msg = errObj.errors.shift()!.message
        msg += errObj.errors.map(err => '\t' + err.message).join('  ')
    } catch {
        try {
            msg = await response.text()
        } catch {
            msg = `Unknown Errror. Status: ${response.statusText} (${response.status})`
        }
    }
    return new Error(msg)
}

interface ErrorResponse {
    errors: { message: string }[]
}