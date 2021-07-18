import serverlessMysql from "serverless-mysql";

export const db = serverlessMysql({
    config:{
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DTABASE,
      password: process.env.MYSQL_PASSWORD,
      port: 3306
    }
  });