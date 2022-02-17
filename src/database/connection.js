import sql from 'mssql';
import config from "../config"; 

let buff = Buffer.from(config.db_password, 'base64');  
let db_password = buff.toString('utf-8');

export const dbSettings = {
    user: config.db_user,
    password: db_password,
    server: config.db_server,
    database: config.db_database,
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
}

export const getConnection = async () => {
    try {
      let pool = await sql.connect(dbSettings);
      return pool;
    } catch (error) {
      console.error(error);
    }
};

export { sql };