import mysql from 'mysql2/promise'
// const mysql = require('mysql2/promise');

// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,        // 替换成你的用户名
  password: process.env.DB_PASSWORD,// 替换成你的密码
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

export default pool