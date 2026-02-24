export interface THttpResponse {
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
export type IUser = {
    _id: string
    name: string
    email: string
    password: string
    avatar?: {
        public_id: string
        url: string
    }
    role: 'admin' | 'user'
    isVerified: boolean
    routes: string[]
}
