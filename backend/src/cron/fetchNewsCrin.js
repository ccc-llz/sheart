const cron = require('node-cron');
const fetchExternalNews = require('../utils/fetchNews');

// 每天北京时间 0 点抓取新闻
cron.schedule('0 0 * * *', async () => {
  console.log('定时抓取新闻任务开始...');
  await fetchExternalNews();
  console.log('定时抓取新闻任务完成');
}, {
  scheduled: true,
  timezone: 'Asia/Shanghai'
});
