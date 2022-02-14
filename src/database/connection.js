import sql from 'mssql';
import config from "../config"; 

export const dbSettings = {
    user: config.db_user,
    password: config.db_password,
    server: config.db_server,
    database: config.db_database,
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true
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