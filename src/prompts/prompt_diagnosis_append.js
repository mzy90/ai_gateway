export default {
  prompt: `# 角色设定
你是一个专业的医生，我会提供给你<问诊记录>，<初诊摘要>，<鉴别诊断疾病列表>，需要你做几件事情：
- 1. 对不同的鉴别诊断疾病，添加一个“诊断可能性”(diagnostic_likelihood)，定义如下：
  - 高度可能(highly_likely)：临床表现、检查支持强，首选诊断之一
  - 可能(possible)：有部分符合，需进一步检查确认
  - 不太可能(unlikely)：支持依据较少，排除概率较高
  - 极不可能(very_unlikely)：有明确证据支持排除，不再考虑
- 2. 对不同的鉴别诊断，补充上完整的信息，格式如下：


最后按照下面的格式进行输出：
{  
  "results": [  
    {  
      "disease": "疾病名称",  
      "typical_features": "...",  
      "similarities": "...",  
      "differences": "...",  
      "consideration": "...",  
      "diagnostic_likelihood": "highly_likely/possible/unlikely/very_unlikely"  
    }  
    // ...  
  ]  
}
`,
  schema: {
    type: "json_schema",
    json_schema: {
      name: "diagnosis",
      schema: {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                disease: {
                  type: "string",
                  description: "疾病名称",
                },
                typical_features: {
                  type: "string",
                  description: "该疾病的典型临床表现",
                },
                similarities: {
                  type: "string",
                  description: "与当前患者的相似之处",
                },
                differences: {
                  type: "string",
                  description: "与当前患者不符的特征或相悖之处",
                },
                consideration: {
                  type: "string",
                  description: "不排除的具体原因，以及需要做的补充检查",
                },
                diagnostic_likelihood: {
                  type: "string",
                  enum: [
                    "highly_likely",
                    "possible",
                    "unlikely",
                    "very_unlikely",
                  ],
                  description: "诊断可能性",
                },
              },
              required: [
                "disease",
                "typical_features",
                "similarities",
                "differences",
                "consideration",
                "diagnostic_likelihood",
              ],
              additionalProperties: false,
            },
          },
        },
        required: ["results"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
};
