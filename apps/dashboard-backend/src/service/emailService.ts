interface EmailOptions {
    email: string
    subject: string
    template: string
    data: { [key: string]: unknown }
}
export default {
    sendEmail: async (_options: EmailOptions): Promise<void> => {}
}
