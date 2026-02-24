import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import config from '../config/config.js'

interface EmailOptions {
    email: string
    subject: string
    template: string
    data: { [key: string]: unknown }
}
export default {
    sendEmail: async (options: EmailOptions): Promise<void> => {
        const transporter: Transporter = nodemailer.createTransport({
            host: config.SMTP_HOST!,
            port: parseInt(config.SMTP_PORT! || '587'),
            service: config.SMTP_SERVICE!,
            auth: {
                user: config.SMTP_MAIL!,
                pass: config.SMTP_PASSWORD!
            }
        })

        const { email, subject, template, data } = options

        const templatePath = path.join(import.meta.dirname, '../mails', template)

        const html: string = await ejs.renderFile(templatePath, data)
        const mailOptions = {
            from: config.SMTP_MAIL,
            to: email,
            subject,
            html
        }
        await transporter.sendMail(mailOptions)
    }
}
