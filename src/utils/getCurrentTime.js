export default function getCurrentTime() {
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return now.toLocaleString('zh-CN', options);
};