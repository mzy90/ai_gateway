import VolcanoAIService from "../libs/Volcano/VolcanoAIService.js";
import MainStore from "../libs/MainStore/MainStore.js";
import { validateRequest } from "../utils/requestValidator.js";
import createPatientPrompt from "../utils/createPatientPrompt.js";

class ChatController {
  constructor() {
    this.aiService = new VolcanoAIService();
  }

  chat = async (request, reply) => {
    try {
      const { accessToken, platform } = validateRequest(request);

      const { question, is_base_info, patient_id, conversation_id } =
        request.body;

      const mainStore = new MainStore({
        accessToken,
        platform,
      });
      // 如果没有会话，则创建
      if (!conversation_id) {
        return await mainStore.createConversation({ question });
      }

      // 创建用户基础信息
      if (is_base_info) {
        if (!patient_id) {
          throw new Error(`patient_id 不能为空`);
        }
        return await this.patient(
          {
            is_base_info,
            patient_id,
            conversation_id,
          },
          mainStore
        );
        // return await mainStore.setUserInfo({
        //   is_base_info,
        //   patient_id,
        //   conversation_id,
        // });
      }
      return await this.ask({ conversation_id, question }, mainStore);
    } catch (error) {
      let errorMessage = error.message;
      return reply.code(error.response?.status || 500).send({
        success: false,
        error: errorMessage,
      });
    }
  };

  async patient({ is_base_info, patient_id, conversation_id }, mainStore) {
    const response = await mainStore.getPatientPayload({
      is_base_info,
      patient_id,
      conversation_id,
    });
    const preMessages = response.data.messages.messages;
    const patient = response.data.messages.patient;
    const user_id = response.data.user_id;
    const patientStr = createPatientPrompt(patient);
    const messages = [
      ...preMessages,
      {
        role: "user",
        content: patientStr,
      },
    ];
    const aiResult = await this.aiService.chat(messages, "prompt_ask", {
      conversation_id,
      user_id,
      api_name: "ask",
    });
    const updateResult = await mainStore.setUserInfo({
      is_base_info,
      patient_id,
      conversation_id,
      answer: aiResult.answer,
    });
    return updateResult;
  }

  async ask({ conversation_id, question }, mainStore) {
    const payloadRes = await mainStore.getAskPayload({
      conversation_id,
      question,
    });
    const { messages, user_id } = payloadRes.data;
    const aiResult = await this.aiService.chat(messages, "prompt_ask", {
      conversation_id,
      user_id,
      api_name: "ask",
    });
    if (!aiResult.answer) {
      throw new Error(`网络错误，请稍后重试`);
    }
    const updateResult = await mainStore.setAskResult({
      conversation_id,
      answer: aiResult.answer,
    });
    return updateResult;
  }
}

export default new ChatController();
