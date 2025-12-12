import pool from "./index.js";

// 获取用户
export async function getUser({
  username, password
}) {
  const sql = `
    select *
    from  store_user  
    WHERE username = ? AND password = ?
  `;
  const params = [username, password];

  try {
    const [result] = await pool.execute(sql, params);
    return result[0]
  } catch (err) {
    console.error("获取用户失败:", err);
  }
}
