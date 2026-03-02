export type THttpResponse = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
}

export type THttpError = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
    trace?: object | null
}

export type TGoogleOAuthToken = {
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
    token_type: 'Bearer'
    id_token: string
    refresh_token_expires_in: number
}

export type TGoogleUserInfo = {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    picture: string
}
