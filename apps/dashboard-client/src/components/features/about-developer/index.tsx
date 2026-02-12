import React from 'react'
import constants from '@/constants'

const AboutDeveloper = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 text-sm text-foreground">
            <h1 className="text-2xl font-bold mb-4">About FIGGO DEV</h1>

            <p>
                FIGGO DEV LLC is a software development company focused on building professional, enterprise-grade automation, workflow, and
                monitoring solutions. Our flagship product, <span className="font-semibold">FIGGO ATLAS</span>, empowers organizations to manage bots,
                workflows, and operational intelligence in a secure and compliant environment.
            </p>

            <h2 className="mt-6 text-lg font-semibold">Developer Information</h2>
            <ul className="list-disc list-inside">
                <li>Name: FIGGO DEV LLC</li>
                <li>
                    Website:{' '}
                    <a
                        href={constants.DEVELOPER_WEBSITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline">
                        {constants.DEVELOPER_WEBSITE}
                    </a>
                </li>
                <li>Year Established: 2026</li>
                <li>
                    Email:{' '}
                    <a
                        href={`mailto:${constants.DEVELOPER_EMAIL}`}
                        className="hover:underline">
                        {constants.DEVELOPER_EMAIL}
                    </a>
                </li>
            </ul>

            <h2 className="mt-6 text-lg font-semibold">Mission</h2>
            <p>To provide enterprise-grade automation and workflow management tools that are secure, compliant, and highly reliable.</p>

            <h2 className="mt-6 text-lg font-semibold">Legal Notice</h2>
            <p>
                © 2026 FIGGO DEV LLC. All rights reserved. This system is intended for authorized use only. Unauthorized access or misuse may violate
                applicable laws and platform policies.
            </p>
        </div>
    )
}

export default AboutDeveloper
