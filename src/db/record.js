import pool from "./index.js";

// 写日志函数
export async function insertRecord({
  channel_id,
  conversation_id,
  diagnosis,
  messages,
  user_info,
  mobile
}) {
  const sql = `
    INSERT INTO active_records
    (channel_id,conversation_id,diagnosis,messages,user_info, mobile)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [channel_id,conversation_id,diagnosis,messages,user_info, mobile];

  try {
    const [result] = await pool.execute(sql, params);
    console.log("日志插入成功，ID:", result.insertId);
  } catch (err) {
    console.error("日志插入失败:", err);
  }
}
