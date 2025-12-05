import pool from "./index.js";

// 写日志函数
export async function insertLog(log) {
  const sql = `
    INSERT INTO ai_gateway_log
    (user_id, store_id, api_name, model, request_payload, response_payload, success, error_message, retry_count, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    log.user_id || 0,
    log.store_id || 0,
    log.api_name || '',
    log.model || '',
    JSON.stringify(log.request_payload || {}),
    JSON.stringify(log.response_payload || {}),
    log.success !== undefined ? log.success : 1,
    log.error_message || null,
    log.retry_count || 0,
    log.duration_ms || 0
  ];

  try {
    const [result] = await pool.execute(sql, params);
    console.log('日志插入成功，ID:', result.insertId);
  } catch (err) {
    console.error('日志插入失败:', err);
  }
}
