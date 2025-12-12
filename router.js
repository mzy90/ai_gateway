import ChatController from "./src/controller/Chat.js";
import DiagnosticController from "./src/controller/Diagnostic.js";
import OptionsController from "./src/controller/Options.js";
import LoginController from "./src/controller/Login.js";
import RecordController from "./src/controller/Record.js";

async function routes(fastify, options) {
  // 健康检查
  fastify.get("/health", async (request, reply) => {
    return {
      status: "ok",
      service: "volcano-ai-gateway",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  });

  // AI聊天接口
  fastify.post("/api/chat", ChatController.chat);
  fastify.post(
    "/api/diagnostic",
    {
      config: {
        timeout: 90000, // 为这个路由单独设置90秒超时
      },
    },
    DiagnosticController.diagnostic
  );
  fastify.post("/api/option", OptionsController.index);
  fastify.post("/login", LoginController.index);
  fastify.post(
    "/store/record",
    { preHandler: fastify.authenticate },
    RecordController.index
  );
  fastify.post(
    "/store/setRecordRate",
    { preHandler: fastify.authenticate },
    RecordController.setRecordRate
  );
}

export default routes;
