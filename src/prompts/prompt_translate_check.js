export default {
  prompt: `你是一位医学英语专家。我会提供你一段医学相关的 <英文原文> 与其对应的 <中文翻译>，请你完成以下两项任务：
---
## 1. 内容完整性校验
- 比较原文与翻译内容的一致性，仅判断是否存在明显的缺漏、错译或多译情况。如果译文虽然不是最严谨的表达，但属于行业中普遍接受的译法，也视为“无问题”。请避免因为风格或细节偏好而标注为“有轻微问题”
- 根据问题的严重程度，判断翻译的整体完整性状态（以下三选一）：
  - “无问题”：翻译完整且准确。
  - “有轻微问题”：存在部分遗漏、误译或增译，但整体意思基本对应。
  - “问题严重”：存在明显的内容缺失或误译，影响理解。
- 如发现内容不符，请指出有问题的原文段落，说明缺失/多译/错译的内容，并简要建议如何改进。
---
## 2. 英文语法校验
- 只针对中文翻译进行语法检查，不改动其医学专业术语或内容含义。
- 根据语法错误的多少和严重程度，给出语法状态判断（以下三选一）：
  - “no_issues”：语法完全正确。
  - “minor_issues”：存在轻微语法错误，但基本不影响理解。
  - “major_issues”：语法错误明显，影响句意表达和理解。
- 如有语法错误，请列出每个问题，包括：
  - 出错的原句或片段
  - 错误简述
  - 修改建议（正确表达方式）
---
## 3. 输出格式（JSON）
请按以下 JSON 格式输出校验结果：
\`\`\`json
{
  "integrity": {
    "status": "[no_issues / minor_issues / major_issues]",
    "issues": [
      {
        "source": "有问题的英文片段",
        "problem": "问题描述（如缺译、错译、增译）",
        "suggestion": "简要修改建议"
      }
    ]
  },
  "grammar": {
    "status": "[no_issues / minor_issues / major_issues]",
    "issues": [
      {
        "source": "出错的句子或片段",
        "problem": "问题描述（如缺译、错译、增译）",
        "suggestion": "简要修改建议"
      }
    ]
  }
}
\`\`\`
---
以下是需要你检查的文本：  
`,
  schema: {
    type: "json_schema",
    json_schema: {
      name: "translate_check",
      schema: {
        type: "object",
        properties: {
          integrity: {
            type: "object",
            description: "内容完整性检查结果",
            properties: {
              status: {
                type: "string",
                enum: ["no_issues", "minor_issues", "major_issues"],
                description: "完整性问题的严重程度",
              },
              issues: {
                type: "array",
                description: "发现的具体完整性问题",
                items: {
                  type: "object",
                  properties: {
                    source: {
                      type: "string",
                      description: "有问题的英文片段",
                    },
                    problem: {
                      type: "string",
                      description: "问题描述（如缺译、错译、增译）",
                    },
                    suggestion: {
                      type: "string",
                      description: "简要修改建议",
                    },
                  },
                  required: ["source", "problem", "suggestion"],
                },
              },
            },
            required: ["status", "issues"],
          },
          grammar: {
            type: "object",
            description: "语法和表达问题检查结果",
            properties: {
              status: {
                type: "string",
                enum: ["no_issues", "minor_issues", "major_issues"],
                description: "语法问题的严重程度",
              },
              issues: {
                type: "array",
                description: "发现的具体语法或表达问题",
                items: {
                  type: "object",
                  properties: {
                    source: {
                      type: "string",
                      description: "出错的句子或片段",
                    },
                    problem: {
                      type: "string",
                      description: "问题描述（如语法错误、词性混乱、表达不清）",
                    },
                    suggestion: {
                      type: "string",
                      description: "简要修改建议",
                    },
                  },
                  required: ["source", "problem", "suggestion"],
                },
              },
            },
            required: ["status", "issues"],
          },
        },
        required: ["integrity", "grammar"],
      },
      strict: true,
    },
  },
};
