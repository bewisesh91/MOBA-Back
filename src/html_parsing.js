const express = require('express');
const parsingRouter = express.Router();
const cheerio = require('cheerio');
const axios = require('axios');

// // html 파싱
// // method : post
parsingRouter.post('/', async (req, res) => {
  console.log(req.body.url);
  axios.get(req.body.url).then((dataa) => {
    // console.log(dataa.data);
    let shop_name, shop_url, img_url, product_name, price, sale_price;
    const $ = cheerio.load(dataa.data); // html load

    shop_name = '브랜디';
    shop_url = req.body.url;
    img_url = $("meta[property='og:image']").attr('content');
    product_name = $(
      '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail_title_area > h1',
    ).text();
    price = $(
      '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail-price-wrapper.hideFinalPriceSection > div > div > span > span',
    ).text();
    sale_price = $(
      '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail-price-wrapper.hideFinalPriceSection > div > div > em > span',
    ).text();

    const new_product = {
      product_name: product_name,
      price: price,
      sale_price: sale_price,
      shop_name: shop_name,
      shop_url: shop_url,
      img: img_url,
    };
    console.log(new_product);
  });
  res.send('form back');
});

module.exports = parsingRouter;
