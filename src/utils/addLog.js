import crypto from "crypto";
import MainStore from "../libs/MainStore/MainStore.js";

const SECRET = process.env.AI_LOG_SECRET;

function signPayload(timestamp, payload) {
  const data = timestamp + JSON.stringify(payload);
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export default async function sendLog(payload) {
  const timestamp = Math.floor(Date.now() / 1000);

  const mainStore = new MainStore({
    accessToken: "",
    platform: null,
  });

  const sign = signPayload(timestamp, payload);

  const payloadRes = await mainStore.addLog({
    timestamp,
    payload,
    sign,
  });
  return payloadRes;
}
