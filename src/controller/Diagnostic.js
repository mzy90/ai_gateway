import VolcanoAIService from "../libs/Volcano/VolcanoAIService.js";
import MainStore from "../libs/MainStore/MainStore.js";
import { validateRequest } from "../utils/requestValidator.js";
import formatConversationForAI from "../utils/formatConversationForAITS.js";
import { insertRecord } from "../db/record.js";

class DiagnosticController {
  constructor() {
    this.aiService = new VolcanoAIService();
  }

  diagnostic = async (request, reply) => {
    try {
      const { accessToken, platform } = validateRequest(request);

      const { conversation_id } = request.body;

      const mainStore = new MainStore({
        accessToken,
        platform,
      });
      if (!conversation_id) {
        throw new Error(`conversation_id 不能为空`);
      }
      const payloadRes = await mainStore.getDiagnosticConversation({
        conversation_id,
      });
      const { messages, user_info, mobile } = payloadRes.data;
      const { user_id, channel_id } = user_info;
      const _messages = this.getPureMessages(messages)

      const aiResult = await this.firstDiagnostic({
        messages: _messages,
        conversation_id,
        user_id,
      });

      const appendResult = await this.secondDiagnostic({
        aiResult,
        messages: _messages,
        conversation_id,
        user_id,
      });

      const mergedResult = this.mergeDiagnostic(aiResult, appendResult);

      const updateResult = await mainStore.setDiagnostic({
        conversation_id,
        aiResult: mergedResult,
      });
      if (channel_id) {
        await insertRecord({
          channel_id,
          conversation_id,
          diagnosis: mergedResult,
          messages,
          user_info,
          mobile
        });
      }
      return updateResult;
    } catch (error) {
      let errorMessage = error.message;
      return reply.code(error.response?.status || 500).send({
        success: false,
        error: errorMessage,
      });
    }
  };

  // 第一步诊断
  async firstDiagnostic({ messages, conversation_id, user_id }) {
    const aiResult = await this.aiService.chat(messages, "prompt_diagnosis", {
      conversation_id,
      user_id,
      api_name: "firstDiagnostic",
    });
    if (!aiResult.answer) {
      throw new Error(`网络错误，请稍后重试`);
    }
    return aiResult;
  }

  // 第二步补充诊断
  async secondDiagnostic({ aiResult, messages, conversation_id, user_id }) {
    const xmlQuery = formatConversationForAI(messages);

    const payload = [
      {
        role: "user",
        content: `
<问诊记录>
${xmlQuery}
</问诊记录>
<初诊摘要>
${aiResult.answer.diagnosis.preliminary_diagnosis}
</初诊摘要>
<鉴别诊断疾病列表>
${aiResult.answer.diagnosis.differential_diagnosis}
</鉴别诊断疾病列表>
      `,
      },
    ];
    const result = await this.aiService.chat(
      payload,
      "prompt_diagnosis_append",
      { conversation_id, user_id, api_name: "secondDiagnostic" }
    );

    return result.answer.results;
  }

  mergeDiagnostic(aiResult, appendResult) {
    aiResult.answer.diagnosis.differential_diagnosis = appendResult;
    return aiResult.answer;
  }
  getPureMessages (messages) {
    return messages.map(item => ({content: item.content, role: item.role}))
  }
}

export default new DiagnosticController();
