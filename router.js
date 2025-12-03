import ChatController from './src/controller/Chat.js';
import DiagnosticController from './src/controller/Diagnostic.js';
import OptionsController from './src/controller/Options.js';

async function routes(fastify, options) {
  // 健康检查
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      service: 'volcano-ai-gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  });

  // AI聊天接口
  fastify.post('/api/chat', ChatController.chat);
  fastify.post('/api/diagnostic', DiagnosticController.diagnostic);
  fastify.post('/api/option', OptionsController.index);
}

export default routes;