import request from "../../utils/request.js";

// 调用主服务
class MainStore {
  constructor({ accessToken, platform }) {
    this.accessToken = accessToken;
    this.platform = platform;
  }
  // 创建空白会话
  async createConversation({ question }) {
    const path = "index.php?s=/api/DiagnosticCGateway/createConversation";
    return await this.callMainStore(path, { question });
  }
  // 获取payload
  async getAskPayload({ conversation_id, question }) {
    const path = "index.php?s=/api/DiagnosticCGateway/getAskPayload";
    return await this.callMainStore(path, { conversation_id, question });
  }
  // 设置结果
  async setAskResult({ conversation_id, answer }) {
    const path = "index.php?s=/api/DiagnosticCGateway/setAskResult";
    return await this.callMainStore(path, { conversation_id, answer });
  }

  // 设置诊断结果
  async setDiagnostic({ conversation_id, aiResult }) {
    const path = "index.php?s=/api/DiagnosticCGateway/setDiagnostic";
    return await this.callMainStore(path, { conversation_id, aiResult });
  }

  // 获取会话messages
  async getDiagnosticConversation({ conversation_id }) {
    const path =
      "index.php?s=/api/DiagnosticCGateway/getDiagnosticConversation";
    return await this.callMainStore(path, { conversation_id });
  }

  // 获取conversation
  async getConversation({ conversation_id }) {
    const path =
      "index.php?s=/api/DiagnosticCGateway/getConversation";
    return await this.callMainStore(path, { conversation_id });
  }

  // 获取就诊人员
  async getPatientPayload({ is_base_info, patient_id, conversation_id }) {
    const path = `index.php?s=/api/DiagnosticCGateway/getPatientPayload`;
    return await this.callMainStore(path, { is_base_info, patient_id, conversation_id });
  }

  // 设置用户信息
  async setUserInfo({ is_base_info, patient_id, conversation_id, answer }) {
    const path = "index.php?s=/api/DiagnosticCGateway/setUserInfo";
    return await this.callMainStore(path, {
      is_base_info,
      patient_id,
      conversation_id,
      answer
    });
  }

  // 获取用户信息
  async userInfo() {
    const path = "index.php?s=/api/user/cgateway_info";
    return await this.callMainStore(path);
  }


  async callMainStore(path, data) {
    const res = await request({
      url: path,
      headers: {
        "Access-Token": this.accessToken,
        platform: this.platform,
      },
      data,
    });

    // 如果状态码不是 200-299，直接抛出错误
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`${res.status} - ${JSON.stringify(res.data)}`);
    }

    // 如果业务状态码不是 200，也抛出错误
    if (res.data.status !== 200) {
      throw new Error(`${res.data.status} - ${res.data.message || "未知错误"}`);
    }

    // 返回成功的数据
    return res.data;
  }
}

export default MainStore;
