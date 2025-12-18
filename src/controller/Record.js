import { getRecordList, getRecordById, setRecordRateById } from "../db/activeRecord.js";

class Record {
  constructor() {}

  index = async (request, reply) => {
    try {
      const channel_id = request.user.channel_id; // ⭐ 从 token 获取
      const mobile = request.body?.mobile || null; // mobile 可选
      const page = Number(request.body.page) || 1;
      const pageSize = Number(request.body.pageSize) || 20;

      if (!channel_id || !pageSize || !page) {
        return reply.code(400).send({
          success: false,
          error: "参数不合规",
        });
      }
      const result = await getRecordList({
        channel_id,
        mobile,
        pageSize,
        page,
      });

      reply.send({
        success: true,
        data: result || null,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  };
  setRecordRate = async (request, reply) => {
    try {
      const channel_id = request.user.channel_id;
      const store_user_id = request.user.store_user_id;

      const {
        active_records_id,
        consultation_accuracy_score,
        diagnosis_accuracy_score,
        overall_score,
        doctor_conclusion,
      } = request.body;

      // ⭐ 参数校验（修正你的反向判断）
      if (
        !channel_id ||
        !store_user_id ||
        !active_records_id ||
        consultation_accuracy_score == null ||
        diagnosis_accuracy_score == null ||
        overall_score == null
      ) {
        return reply.code(400).send({
          success: false,
          error: "参数不合规，缺少必要字段",
        });
      }

      // ⭐ 1. 先查询该记录是否存在
      const record = await getRecordById(active_records_id);
      if (!record) {
        return reply.code(404).send({
          success: false,
          error: "记录不存在",
        });
      }
      // ⭐ 2. 校验记录的 channel_id
      if (record.channel_id !== channel_id) {
        return reply.code(403).send({
          success: false,
          error: "无权限：记录不属于你的渠道",
        });
      }
      // 写入数据库
      const result = await setRecordRateById({
        active_records_id,
        consultation_accuracy_score,
        diagnosis_accuracy_score,
        overall_score,
        doctor_conclusion,
        store_user_id,
      });

      reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  };
}

export default new Record();
