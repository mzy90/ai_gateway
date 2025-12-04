// volcanoAIService.js
import axios from "axios";
import getPromptConfig from "../../prompts/index.js";
import addLog from "../../utils/addLog.js";

class VolcanoAIService {
  constructor() {
    this.apiKey = process.env.VOLCANO_API_KEY;
    this.baseUrl = "https://ark.cn-beijing.volces.com/api/v3";
    this.chatUrl = "/chat/completions";
    this.model = "deepseek-v3-1-terminus";

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  async chatHandler(data, requestInfo) {
    const maxRetries = 2;
    let attempts = 0;
    let lastError;
    const startTime = Date.now();

    while (attempts <= maxRetries) {
      try {
        const response = await this.client.post(this.chatUrl, {
          model: this.model,
          temperature: 0,
          ...data,
        });

        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        const parsedResult = this.parseResult(
          response.data.choices[0]?.message?.content
        );

        // === LOG 成功 ===
        await addLog({
          user_id: requestInfo?.user_id || 0,
          api_name: requestInfo?.api_name,
          model: this.model,
          request_payload: data,
          response_payload: response.data,
          success: 1,
          retry_count: attempts,
          duration_ms: Date.now() - startTime,
        });

        return parsedResult;
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts > maxRetries) break;
      }
    }

    // === LOG 失败 ===
    await addLog({
      user_id: requestInfo?.user_id || 0,
      api_name: "volcano_chat",
      store_id: requestInfo?.store_id || 0,
      model: this.model,
      request_payload: data,
      response_payload: null,
      success: 0,
      error_message: lastError?.message,
      retry_count: maxRetries,
      duration_ms: Date.now() - startTime,
    });

    throw lastError;
  }

  async chat(messages, type, requestInfo) {
    try {
      const payload = this.mergeAIPayload(messages, type);
      const parsedResult = await this.chatHandler(payload, requestInfo);
      return parsedResult;
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  parseResult(answerString) {
    try {
      const answer = JSON.parse(answerString);
      return {
        answer,
        original_response: answerString,
      };
    } catch (error) {
      throw new Error("返回结构错误");
    }
  }

  mergeAIPayload(messages, type) {
    if (!type) return { messages };

    const { prompt, schema } = getPromptConfig(type);
    return {
      messages: [
        {
          role: "system",
          content: prompt,
        },
        ...messages,
      ],
      response_format: schema,
    };
  }
}

export default VolcanoAIService;
