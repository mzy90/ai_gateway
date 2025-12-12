import Fastify from 'fastify'
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import 'dotenv/config'
import router from './router.js'

const fastify = Fastify({ 
  logger: true,
  connectionTimeout: 95000,  // 改为35秒（比30秒稍长）
  requestTimeout: 90000      // 改为30秒（默认超时）
})


// 注册 cookie
fastify.register(fastifyCookie, {
  secret: "cookie-secret_t2", // 随便填，但要安全
});

// 注册 JWT
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET, // 用环境变量存
  cookie: {
    cookieName: "token",
    signed: false
  }
});

// 基本 CORS 支持
fastify.addHook('onRequest', (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", request.headers.origin || "*");
  reply.header("Access-Control-Allow-Credentials", "true");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (request.method === "OPTIONS") {
    return reply.code(200).send();
  }
  done();
})
fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify(); // 自动从 cookie 或 Authorization 取 token
  } catch (err) {
    return reply.code(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
});

// 注册路由
fastify.register(router)

// ⭐ 统一 404 处理
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    success: false,
    message: "Route not found",
    path: request.url,
  });
});

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