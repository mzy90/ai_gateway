// volcanoAIService.js
import axios from "axios";
import getPromptConfig from "../../prompts/index.js";
import { insertLog } from "../../db/log.js";

class VolcanoAIService {
  // 静态变量，所有实例共享
  static apiKeys = [];
  static currentKeyIndex = 0;

  constructor() {
    // 初始化API Keys（只执行一次）
    if (VolcanoAIService.apiKeys.length === 0) {
      VolcanoAIService.apiKeys = process.env.VOLCANO_API_KEY
        ? process.env.VOLCANO_API_KEY.split(',').map(key => key.trim()).filter(key => key)
        : [];
      
      if (VolcanoAIService.apiKeys.length === 0) {
        throw new Error("VOLCANO_API_KEY环境变量未设置或格式错误");
      }
    }
    
    this.baseUrl = "https://ark.cn-beijing.volces.com/api/v3";
    this.chatUrl = "/chat/completions";
    this.model = "deepseek-v3-1-terminus";
    
    // 创建基础客户端
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }
  
  // 简单的轮询获取下一个key
  static getNextApiKey() {
    const key = VolcanoAIService.apiKeys[VolcanoAIService.currentKeyIndex];
    // 轮询到下一个
    VolcanoAIService.currentKeyIndex = 
      (VolcanoAIService.currentKeyIndex + 1) % VolcanoAIService.apiKeys.length;
    console.log('currentKeyIndex', VolcanoAIService.currentKeyIndex)
    return key;
  }

  async chatHandler(data, requestInfo) {
    const maxRetries = 2;
    let attempts = 0;
    let lastError;
    const startTime = Date.now();

    while (attempts <= maxRetries) {
      try {
        // 每次请求都使用下一个key
        const currentApiKey = VolcanoAIService.getNextApiKey();
        const currentKeyIndex = (VolcanoAIService.currentKeyIndex - 1 + VolcanoAIService.apiKeys.length) % VolcanoAIService.apiKeys.length;
        
        const response = await this.client.post(this.chatUrl, {
          model: this.model,
          temperature: 0,
          ...data,
        }, {
          headers: {
            Authorization: `Bearer ${currentApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        const parsedResult = this.parseResult(
          response.data.choices[0]?.message?.content
        );

        // === LOG 成功 ===
        await insertLog({
          user_id: requestInfo?.user_id || 0,
          api_name: requestInfo?.api_name,
          model: this.model,
          request_payload: data,
          response_payload: response.data,
          success: 1,
          retry_count: attempts,
          api_key_index: currentKeyIndex, // 记录使用的key索引
          duration_ms: Date.now() - startTime,
        });

        return parsedResult;
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts > maxRetries) break;
        
        // 等待一下再重试
        await new Promise(resolve => setTimeout(resolve, 500 * attempts));
      }
    }

    // === LOG 失败 ===
    await insertLog({
      user_id: requestInfo?.user_id || 0,
      api_name: "volcano_chat",
      store_id: requestInfo?.store_id || 0,
      model: this.model,
      request_payload: data,
      response_payload: null,
      success: 0,
      error_message: lastError?.message,
      retry_count: maxRetries,
      api_key_index: VolcanoAIService.currentKeyIndex, // 记录最后使用的key索引
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
  
  // 获取状态信息
  static getStatus() {
    return {
      totalKeys: VolcanoAIService.apiKeys.length,
      currentKeyIndex: VolcanoAIService.currentKeyIndex,
    };
  }
}

export default VolcanoAIService;