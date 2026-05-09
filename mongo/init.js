// Switch to your DB
db = db.getSiblingDB('scraper-prod')

// 1️⃣ App user (FULL CONTROL on this DB)
db.createUser({
    user: 'nodejs',
    pwd: '233444555566666',
    roles: [
        { role: 'dbOwner', db: 'scraper-prod' } // full control (including delete)
    ]
})

// 2️⃣ Custom role (NO DELETE)
db.createRole({
    role: 'noDeleteEditor',
    privileges: [
        {
            resource: { db: 'scraper-prod', collection: '' },
            actions: ['find', 'insert', 'update', 'listCollections', 'listIndexes']
        }
    ],
    roles: []
})

// 3️⃣ Compass user
db.createUser({
    user: 'editor',
    pwd: '12345',
    roles: [{ role: 'noDeleteEditor', db: 'scraper-prod' }]
})
