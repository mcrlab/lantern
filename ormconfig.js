module.exports = {
    "type": "postgres",
    "host": process.env.POSTGRES_HOST,
    "port": process.env.POSTGRES_PORT,
    "username": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB,
    "synchronize": true,
    "logging": false,
    "entities": [
        "dist/entity/**/*.js"
    ],
    "migrations": [
        "dist/migration/**/*.js"
    ],
    "subscribers": [
        "dist/subscriber/**/*.js"
    ],
    "cli": {
        "entitiesDir": "dist/entity",
        "migrationsDir": "dist/migration",
        "subscribersDir": "dist/subscriber"
    }
}
