export function validateRequest(request) {
  const accessToken = request.headers['access-token'] || request.headers['Access-Token'];
  const platform = request.headers['platform'];
  
  if (!accessToken) {
    const error = new Error('缺少 Access-Token 请求头');
    error.statusCode = 401;
    throw error;
  }
  
  if (!platform) {
    const error = new Error('缺少 platform 请求头');
    error.statusCode = 400;
    throw error;
  }
  
  return { accessToken, platform };
}