export type TClient = {
    username: string
    email: string
    password: string
    passportNumber: string
    stayedCountry: string
    destinationCountry: string
    paymentStatus: 'Paid' | 'Pending'
    appointmentStatus: 'Booked' | 'Not Booked'
    startDate: string
    endDate: string
    tag: string
}

// export enum BotCommands
type RunTask = { handler: 'runTask'; payload: { task: string } }
type disconnect = { handler: 'disconnect'; payload: null }

export type BotCommand = RunTask | disconnect
