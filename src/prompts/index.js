import prompt_ask from "./prompt_ask.js";
import prompt_diagnosis from "./prompt_diagnosis.js";
import prompt_diagnosis_append from "./prompt_diagnosis_append.js";
import prompt_options from "./prompt_options.js";

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

  return {
    prompt: config.prompt,
    schema: config.schema,
  };
}
