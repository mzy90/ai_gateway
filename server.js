import Fastify from 'fastify'
import 'dotenv/config'
import router from './router.js'

const fastify = Fastify({ 
  logger: true 
})

// 基本 CORS 支持
fastify.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'GET, POST')
  done()
})

// 注册路由
fastify.register(router)

// 全局错误处理器
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500
  const message = error.message || '服务器内部错误'
  
  console.error('全局错误处理器捕获:', {
    error: message,
    url: request.url,
    method: request.method,
    statusCode
  })
  
  reply.code(statusCode).send({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  })
})

// 启动服务
const start = async () => {
  try {
    const port = process.env.PORT || 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 服务已启动: http://localhost:${port}`)
  } catch (err) {
    console.error('启动失败:', err)
    process.exit(1)
  }
}

start()