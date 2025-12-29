import prompt_ask from "./prompt_ask.js";
import prompt_diagnosis from "./prompt_diagnosis.js";
import prompt_diagnosis_append from "./prompt_diagnosis_append.js";
import prompt_options from "./prompt_options.js";
import getCurrentTime from "../utils/getCurrentTime.js";

export default function getPromptConfig(type) {
  if (!type) {
    return null;
  }
  const mapper = {
    prompt_ask,
    prompt_diagnosis,
    prompt_diagnosis_append,
    prompt_options,
  };
  const config = mapper[type];
  const prependSystemInfo = `
## 系统背景
当前系统时间是：${getCurrentTime()}。
请在计算患者年龄、评估症状持续时间（如“昨天开始”、“三天前”）时，严格以此时间为基准。

${config.prompt}
  `;

  return {
    prompt: prependSystemInfo,
    schema: config.schema,
  };
}
