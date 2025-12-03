import axios from "axios";
import getPromptConfig from "../../prompts/index.js";

// 火山AI服务类
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

  async chatHandler(data) {
    const response = await this.client.post(this.chatUrl, {
      model: this.model,
      temperature: 0,
      ...data,
    });
    return response.data;
  }

  async chat(messages, type) {
    try {
      const payload = this.mergeAIPayload(messages, type);
      const result = await this.chatHandler(payload);
      const parsedResult = this.parseResult(
        result.choices[0]?.message?.content
      );

      return parsedResult;
    } catch (error) {
      // 统一的错误格式
      throw new Error(error.response?.data?.error?.message);
    }
  }

  parseResult(answerString) {
    const answer = JSON.parse(answerString);

    if (Array.isArray(answer?.suggestion?.medication_guidance)) {
      answer.suggestion.medication_guidance.forEach((item) => {
        if (item?.category && item.category !== "非处方药") {
          item.drug_name = "****";
          item.dosage = "该药品为处方药，请到正规医疗机构获取处方后开具";
          item.course = "-";
          item.precautions = "-";
        }
      });
    }
    if (answer?.status && answer.status === "collection_complete") {
      answer["current_question"] = "信息收集完毕";
    }
    return {
      answer: answer,
      original_response: answerString,
    };
  }
  mergeAIPayload(messages, type) {
    if (!type) {
      return { messages };
    }
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
