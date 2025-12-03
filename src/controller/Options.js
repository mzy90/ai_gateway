import VolcanoAIService from "../libs/Volcano/VolcanoAIService.js";
import MainStore from "../libs/MainStore/MainStore.js";
import { validateRequest } from "../utils/requestValidator.js";
import {returnSuccess} from '../libs/returnHanlder.js'

class OptionsController {
  constructor() {
    this.aiService = new VolcanoAIService();
  }

  index = async (request, reply) => {
    try {
      const { accessToken, platform } = validateRequest(request);
      const { content, conversation_id } = request.body;

      const mainStore = new MainStore({
        accessToken,
        platform,
      });

      // 获取用户信息-做token校验
      const userInfo = await mainStore.userInfo();
      const conversation = await mainStore.getConversation({ conversation_id })
      if (conversation?.data?.result?.status !== 'open') {
        throw new Error(`会话状态错误`);
      }

      const result = await this.aiService.chat(
        [
          {
            role: "user",
            content: content,
          },
        ],
        "prompt_options"
      );

      return returnSuccess(result.answer);
    } catch (error) {
      let errorMessage = error.message;
      return reply.code(error.response?.status || 500).send({
        success: false,
        error: errorMessage,
      });
    }
  };
}

export default new OptionsController();
