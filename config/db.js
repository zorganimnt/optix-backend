require('dotenv').config()

module.exports = {
    "production": {
        "username": process.env.USER_DB,
        "password": process.env.PASSWORD_DB,
        "database": process.env.NAME_DB,
        "host": process.env.HOST_DB,
        "port": 3306,
        "dialect": process.env.DIALECT_DB,
        "timezone": process.env.TIMEZONE_DB,
        "define": {
            "underscored": true,
            "created_At": "created_at",
            "updated_At": "updated_at",
            "deleted_At": "deleted_at"
        }

    },
    "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "development": {
        "username": "root",
        "password": "",
        "database": "optix_dev",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "logging": false
    },
}
