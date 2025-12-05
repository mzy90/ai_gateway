cd /www/wwwroot/ai-gateway
pm2 delete server
npm install
pm2 start server.js -i 4 --name server \
  --node-args="--max-old-space-size=6144" \
  --max-memory-restart 7000M \
  --log-date-format="YYYY-MM-DD HH:mm:ss" \
  --time
pm2 list


# 查看 server 服务的错误日志
pm2 logs server --lines 100   # 最近 100 行

# 或者查看实时滚动日志
pm2 logs server