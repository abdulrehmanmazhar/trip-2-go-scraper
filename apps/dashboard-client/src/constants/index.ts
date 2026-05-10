export default {
    NAME: 'FIGGO ATLAS',
    LOGO_SRC: 'https://trip2go.co.uk/logo.png',
    BACKEND_LINK: import.meta.env.VITE_BACKEND_LINK as string,
    API_VERSION: '/api/v1',
    T_AND_C_PAGE: 'https://trip2go.co.uk/privacy-policy/',
    PRIVACY_POLICY_PAGE: 'https://trip2go.co.uk/privacy-policy/',
    DEVELOPER_WEBSITE: 'https://github.com/abdulrehmanmazhar',
    DEVELOPER_EMAIL: 'abdurrahman.mern@outlook.com',
    DEVELOPER_NAME: '© 2026 FIGGO DEV Labs',
    DEVELOPER_BRANDING: '© 2026 FIGGO DEV Labs. All rights reserved.',
    PUBLIC_WARNING: 'Authorized and compliant use only. Operation of this system must adhere to applicable laws, regulations, and platform policies.',
    PRIVATE_WARNING: 'This system is intended for authorized use within approved operational and compliance boundaries.'
}

export const APIS = {
    LOGIN: '/login',
    SIGNUP: '/registration',
    OTP: '/activate-user',
    UPDATE_ACCESS_TOKEN: '/refresh',
    LOGOUT: '/logout',
    GOOGLE_AUTH_LINK: '/get-google-auth-url',
    GOOGLE_CALLBACK: '/google-callback',
    BOT_VERIFY: '/verify-otp',
    BOT_LIST: '/bots',
    BOT_APPROVE: '/approve-bot',
    BOT_REJECT: '/reject-bot',
    BOT_REVOKE: '/revoke-bot',
    BOT_UNREVOKE: '/unrevoke-bot'
}

export const ROUTES = {
    // Auth / Public
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    OTP: '/auth/otp',
    UNAUTHORIZED: '/auth/unauthorized',
    SUCCESS: '/success',

    // User App (Prefixed with /u)
    USER: {
        DASHBOARD: '/u',
        APPOINTMENT: '/u/appointment-form',
        PAYMENT: '/u/payment-form',
        PROFILE: '/u/profile',
        TERMS: '/u/terms',
        PRIVACY: '/u/privacy',
        ABOUT: '/u/about'
    },

    // Admin App (Prefixed with /admin)
    ADMIN: {
        DASHBOARD: '/admin',
        LIVE_ACTIVITY: '/admin/live-activity',
        BOTS: '/admin/bots',
        WORKFLOWS: '/admin/workflows',
        WORKFLOW_BUILDER: '/admin/workflow-builder',
        CLIENTS: '/admin/clients',
        CLIENT_DATA: '/admin/client-data',
        PROFILE: '/admin/profile',
        TERMS: '/admin/terms',
        PRIVACY: '/admin/privacy',
        ABOUT: '/admin/about'
    }
} as const
