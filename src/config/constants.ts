import dotenv from 'dotenv';
const path = require('path')

export const ENV = process.env.NODE_ENV;

dotenv.config({ path: path.resolve(__dirname, `../../.env.${ENV}`) });

console.log(`App starting in ENV: ${ENV}...`);

// Set the database constants
export const SEQUELIZE_DIALECT = 'postgres';
export const POSTGRES_DB_NAME = process.env.POSTGRES_DB_NAME || "";
export const POSTGRES_USERNAME = process.env.POSTGRES_USERNAME || "";
export const POSTGRES_PASSWORD= process.env.POSTGRES_PASSWORD || "";
export const POSTGRES_HOST = process.env.POSTGRES_HOST || "";
export const POSTGRES_PORT = process.env.POSTGRES_PORT || "5432";
export const EXPRESS_PORT = process.env.EXPRESS_PORT || "3000"

