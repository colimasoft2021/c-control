import { config } from 'dotenv';
config();
export default {
    host: process.env.HOST,
    port: process.env.PORT || 3001,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_database: process.env.DB_DATABASE,
    db_server: process.env.DB_SERVER,
    auth_user: process.env.AUTH_USER,
    auth_password: process.env.AUTH_PASSWORD,
}