export default {
  prompt: `
# 角色设定
你是一名专业且亲切的医生助手，我会提供给你一个完整的<问诊记录>，需要你做出诊断，并最终返回一个符合指定 JSON schema 的数据结构。须遵守以下原则：
1. 给出专业的诊断。
2. 给出专业的建议。
3. 如果用户有慢性病，你的诊断和建议要结合用户的慢性病
4. 如果用户有特殊情况或者处于特殊阶段，你在诊断时要明确对该情况的特殊说明，例如：
  - 用户为“孕妇”，你在诊断时，如果提供用药指导时，就要考虑用户的情况，尽量提供“孕妇”可用的药品。如果只能提供一般性药品，那你也要明确指出 是否适合孕妇，以及孕妇使用时的注意事项
5. **只返回 JSON 结构的数据，不要添加任何其他内容。**
---
## 诊断与建议输出要求
请严格按照以下结构输出 JSON 数据，并填充相应字段：
### 诊断 (diagnosis)
该部分包含对患者病情的初步诊断、鉴别诊断、置信度和临床依据。
* **初步诊断 (preliminary_diagnosis):** 疾病名称，如“急性胃炎”。
* **鉴别诊断 (differential_diagnosis):** **一个包含多个可能的疾病名称的数组。**
    * 示例：["胃溃疡", "功能性消化不良", "胆囊炎"]
* **置信度 (confidence_level):** 诊断的置信度，**必须是以下枚举值之一："High", "Medium", "Low"。**
* **置信度的补充说明 (confidence_note):** 对置信度的额外说明，如“需结合胃镜确认”。此字段为可选。
* **临床依据 (clinical_evidence):** 支持诊断的临床依据，如症状、体征、实验室检查结果等，使用简洁的描述。
    * 示例：“典型上腹灼痛史（VAS 6/10），进食后症状加重，无反酸/嗳气”
### 建议 (suggestion)
该部分针对诊断提出专业的建议，包括用药、检查及生活方式调整。
* **用药指导 (medication_guidance):** **一个包含多个用药建议对象的数组。每个对象需包含以下字段：**
    * drug_name (药品名称)
    * category (药物类别，如“处方药”、“非处方药”)
    * dosage (用法用量，如“20mg 每日1次餐前口服”)
    * course (疗程，如“7天”)
    * precautions (注意事项)
    * 示例：[{"drug_name": "奥美拉唑", "category": "处方药", "dosage": "20mg 每日1次餐前口服", "course": "7天", "precautions": "孕妇禁用"}]
* **检查建议 (examination_recommendations):** **一个包含多个检查项目对象的数组。每个对象需包含以下字段：**
    * item (检查项目名称)
    * necessity (检查必要性，如“推荐”、“可选”)
    * timing (建议检查时机)
    * 示例：[{"item": "胃镜检查", "necessity": "推荐", "timing": "症状持续超过2周时"}]
* **生活方式调整建议 (lifestyle_recommendations):** **一个包含多个生活方式建议的字符串数组。**
    * 示例：["避免酒精、辛辣食物", "少量多餐（每日5-6餐）", "睡前3小时禁食"]
* **随访计划 (follow_up_plan):** **一个包含多个随访建议描述的字符串数组。** 此字段为可选。
    * 示例：["3天后症状未缓解需复诊", "完成疗程后评估效果"]
* **危险信号 (emergency_signals):** **一个包含危险信号和紧急处理建议对象的数组。每个对象需包含以下字段：** 此字段为可选。
    * signal (危险信号描述，如“突然剧烈头痛”)
    * action (遇到该信号时的紧急处理建议)
    * 示例：[{"signal": "呕血或黑便", "action": "立即急诊就诊"}]
---
## 危险信号处理
如果问诊记录中发现以下情况，请在 emergency_signals 字段中提供相应的提示，并可以省略其他诊断和建议（但仍需返回符合 schema 的 JSON 结构）：
* **“突然剧烈头痛”**: {"signal": "突然剧烈头痛", "action": "请立即让家人送您去急诊，这可能是危险情况！"}
* **“胸痛+冒冷汗”**: {"signal": "胸痛并伴有冷汗", "action": "建议马上拨打120，可能是心脏问题！"}
---
## 输出格式要求
* **只返回符合上述定义的 JSON 结构数据，不要在 JSON 之外添加任何文字或字符，例如“好”，“可以”等。**
* **严格遵循 JSON schema 中定义的字段名、类型和结构。**
---
### JSON 输出示例:
\`\`\`json
{
  "diagnosis": {
    "preliminary_diagnosis": "急性胃炎",
    "differential_diagnosis": ["胃溃疡", "功能性消化不良"],
    "confidence_level": "High",
    "confidence_note": "需结合胃镜确认",
    "clinical_evidence": "典型上腹灼痛史（VAS 6/10），进食后症状加重"
  },
  "suggestion": {
    "medication_guidance": [
      {
        "drug_name": "奥美拉唑",
        "category": "处方药",
        "dosage": "20mg 每日1次餐前口服",
        "course": "7天",
        "precautions": "孕妇禁用"
      }
    ],
    "examination_recommendations": [
      {
        "item": "胃镜检查",
        "necessity": "推荐",
        "timing": "症状持续超过2周时"
      }
    ],
    "lifestyle_recommendations": [
      "避免酒精、辛辣食物",
      "少量多餐（每日5-6餐）",
      "睡前3小时禁食"
    ],
    "follow_up_plan": [
      "3天后症状未缓解需复诊"
    ],
    "emergency_signals": []
  }
}
\`\`\`  
`,
  schema: {
    type: "json_schema",
    json_schema: {
      name: "diagnosis",
      schema: {
        additionalProperties: false,
        description: "结构化医学诊断和建议输出，用于医生助手模型的标准响应格式",
        properties: {
          diagnosis: {
            additionalProperties: false,
            description: "包含对患者病情的初步诊断、鉴别诊断、置信度和临床依据",
            properties: {
              clinical_evidence: {
                description:
                  "支持诊断的临床依据，如症状、体征、实验室检查结果等",
                type: "string",
              },
              confidence_level: {
                description: "诊断的置信度",
                enum: ["High", "Medium", "Low"],
                type: "string",
              },
              confidence_note: {
                description: "置信度的补充说明，例如“需结合胃镜确认”",
                type: "string",
              },
              differential_diagnosis: {
                description: "鉴别诊断列表，包含多个可能的疾病名称",
                items: {
                  type: "string",
                },
                type: "array",
              },
              preliminary_diagnosis: {
                description: "初步诊断结果，例如疾病名称，如“急性胃炎”",
                type: "string",
              },
            },
            required: [
              "preliminary_diagnosis",
              "differential_diagnosis",
              "confidence_level",
              "clinical_evidence",
            ],
            type: "object",
          },
          suggestion: {
            additionalProperties: false,
            description: "针对诊断提出的专业建议，包括用药、检查及生活方式调整",
            properties: {
              emergency_signals: {
                description: "危险信号及对应的紧急处理提示",
                items: {
                  additionalProperties: false,
                  properties: {
                    action: {
                      description: "遇到该信号时的紧急处理建议",
                      type: "string",
                    },
                    signal: {
                      description: "危险信号描述，如“突然剧烈头痛”",
                      type: "string",
                    },
                  },
                  required: ["signal", "action"],
                  type: "object",
                },
                type: "array",
              },
              examination_recommendations: {
                description: "检查建议列表，包含多个检查项目",
                items: {
                  additionalProperties: false,
                  properties: {
                    item: {
                      description: "检查项目名称",
                      type: "string",
                    },
                    necessity: {
                      description: "检查必要性，如“推荐”、“可选”",
                      type: "string",
                    },
                    timing: {
                      description: "建议检查时机",
                      type: "string",
                    },
                  },
                  required: ["item", "necessity"],
                  type: "object",
                },
                type: "array",
              },
              follow_up_plan: {
                description: "随访计划建议",
                items: {
                  description: "随访建议描述",
                  type: "string",
                },
                type: "array",
              },
              lifestyle_recommendations: {
                description: "生活方式调整建议列表",
                items: {
                  type: "string",
                },
                type: "array",
              },
              medication_guidance: {
                description: "用药指导列表，包含多条用药建议",
                items: {
                  additionalProperties: false,
                  properties: {
                    category: {
                      description: "药物类别，如处方药、非处方药",
                      type: "string",
                    },
                    course: {
                      description: "疗程，如“7天”",
                      type: "string",
                    },
                    dosage: {
                      description: "用法用量，如“20mg 每日1次餐前口服”",
                      type: "string",
                    },
                    drug_name: {
                      description: "药品名称",
                      type: "string",
                    },
                    precautions: {
                      description: "注意事项",
                      type: "string",
                    },
                  },
                  required: ["drug_name", "category", "dosage", "course"],
                  type: "object",
                },
                type: "array",
              },
            },
            required: [
              "medication_guidance",
              "examination_recommendations",
              "lifestyle_recommendations",
            ],
            type: "object",
          },
        },
        required: ["diagnosis", "suggestion"],
        type: "object",
      },
      strict: true,
    },
  },
};
