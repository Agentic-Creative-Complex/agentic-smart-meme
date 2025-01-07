const dotenv = require('dotenv');
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`) });

module.exports = {
  "production": {
    "username": process.env.POSTGRES_USERNAME,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB_NAME,
    "host": process.env.POSTGRES_HOST,
    "port": process.env.POSTGRES_PORT,
    "dialect": "postgres",
    "seederStorage": "sequelize",
    "seederStorageTableName": "SeederHistory"
  },
  "development": {
    "username": process.env.POSTGRES_USERNAME,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB_NAME,
    "host": process.env.POSTGRES_HOST,
    "port": process.env.POSTGRES_PORT,
    "dialect": "postgres",
    "seederStorage": "sequelize",
    "seederStorageTableName": "SeederHistory"
  },
  "local": {
    "username": process.env.POSTGRES_USERNAME,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB_NAME,
    "host": process.env.POSTGRES_HOST,
    "port": process.env.POSTGRES_PORT,
    "dialect": "postgres",
    "seederStorage": "sequelize",
    "seederStorageTableName": "SeederHistory"
  }
}
