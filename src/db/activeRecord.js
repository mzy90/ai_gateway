import pool from "./index.js";

export async function getRecordList({ channel_id, mobile, page, pageSize }) {
  if (!channel_id) throw new Error("channel_id is required");

  page = Number(page) || 1;
  pageSize = Number(pageSize) || 10;
  const offset = (page - 1) * pageSize;

  const where = [`channel_id = ?`];
  const params = [channel_id];

  if (mobile && mobile.trim() !== "") {
    where.push(`mobile = ?`);
    params.push(mobile);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // 1. 查询总数
  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM active_records ${whereSql}`,
    params
  );
  const total = countRows[0].total;

  // 2. 查询分页数据（LIMIT 可以正常使用 ?, ?）
  const [list] = await pool.query(
    `SELECT *
     FROM active_records
     ${whereSql}
     ORDER BY create_time DESC
     LIMIT ?, ?`,
    [...params, offset, pageSize]
  );

  return {
    list,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRecordById(active_records_id) {
  const [rows] = await pool.query(
    `SELECT * FROM active_records WHERE active_records_id = ? LIMIT 1`,
    [active_records_id]
  );
  return rows[0] || null;
}

/**
 * 写入评价
 */
export async function setRecordRateById({
  active_records_id,
  consultation_accuracy_score,
  diagnosis_accuracy_score,
  overall_score,
  doctor_conclusion,
  store_user_id,
}) {
  const sql = `
    UPDATE active_records
    SET 
      consultation_accuracy_score = ?,
      diagnosis_accuracy_score = ?,
      overall_score = ?,
      doctor_conclusion = ?,
      review_store_user_id = ?,
      is_reviewed = ?,
      review_time = NOW()
    WHERE active_records_id = ?
  `;

  const params = [
    consultation_accuracy_score,
    diagnosis_accuracy_score,
    overall_score,
    doctor_conclusion,
    store_user_id,
    1,
    active_records_id,
  ];

  const [result] = await pool.query(sql, params);

  return {
    updated: result.affectedRows > 0,
  };
}