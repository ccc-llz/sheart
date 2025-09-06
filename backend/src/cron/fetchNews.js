const axios = require('axios');
const NewsItem = require('../models/NewsItem');

const fetchExternalNews = async () => {
  try {
    const res = await axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY');
    const articles = res.data.articles;

    for (let a of articles) {
      await NewsItem.updateOne(
        { url: a.url },
        {
          $setOnInsert: {
            title: a.title,
            content: a.description,
            url: a.url,
            image: a.urlToImage,
            category: 'general',
          },
        },
        { upsert: true }
      );
    }
    console.log('新闻抓取完成');
  } catch (err) {
    console.error('抓取失败', err);
  }
};

module.exports = fetchExternalNews;
