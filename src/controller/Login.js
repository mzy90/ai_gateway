import { getUser } from "../db/storeUser.js";

class Login {
  constructor() {}

  index = async (request, reply) => {
    try {
      const { username, password } = request.body;

      // 使用 request.server 获取 fastify 实例
      const fastify = request.server;

      // 查数据库
      const user = await getUser({ username, password });
      if (!user) {
        return reply.code(401).send({ message: "Invalid credentials" });
      }

      // 生成 token
      const token = fastify.jwt.sign(
        { store_user_id: user.store_user_id, username: user.username, channel_id: user.channel_id },
        { expiresIn: "7d" }
      );

      // 写 Cookie
      reply.setCookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: false,   // 本地必须 false，生产环境再改 true
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({
        success: true,
        message: "Login successful",
        user
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  };
}

export default new Login();
