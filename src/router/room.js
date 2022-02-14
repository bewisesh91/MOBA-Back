const express = require('express');
const roomRouter = express.Router();
const sharedWishList = require('../schemas/sharedWishList');
const cheerio = require('cheerio');
// request module deprecated -> axios 로 교체
const axios = require('axios');
//not allowed
roomRouter.get('/', (req, res) => {
  res.send('this is not rightful access');
});

//room id로 room 별 공유 위시리스트를 req에 넣는다
roomRouter.param('id', async (req, res, next, value) => {
  try {
    console.log(value);
    let wishlist = await sharedWishList.findOne({ room_info: value });
    // collection에 위시리스트 없으면(초기진입 상황) 생성, delete 메소드일때는 생성하지 않는다.
    if (!wishlist && req.method !== 'DELETE') {
      console.log('Not Found Wishlist make new wishlist');
      // insertMany 를 하면 배열을 반환함 -> destructor 사용. insertOne 은 왜 안나오지..?
      [wishlist] = await sharedWishList.insertMany({
        room_info: value,
        products: [],
      });
    }
    req.wishlist = wishlist;
    next();
  } catch (err) {
    next(err);
  }
});

// 함께 쇼핑(외부) - 모바 메인
// url : www.moba.com/room/{roomid}
// method : get
roomRouter.get('/:id', (req, res) => {
  console.log(`this is room N`);
  res.send('this is room N');
});

// 위시리스트 상품 넣기 Helper
async function input_product(wishlist, room_info, new_product) {
  const flag = wishlist.products?.filter(
    (product) => product.shop_url === new_product.shop_url,
  ).length;
  // 중복이 없거나 ( flag == 0) | 아예 상품이 없을때 ( flag == undefined)
  if (flag === 0 || flag === undefined) {
    await sharedWishList.updateOne(
      { room_info: room_info },
      {
        $addToSet: {
          products: new_product,
        },
      },
    );
    return true;
  } else {
    // TODO : 중복 알람 res로 보내기
    console.log('중복된 상품입니다.');
    return false;
  }
}

// w-concept
function w_concept(html, url) {
  let shop_name, shop_url, img_url, product_name, price, sale_price;
  const $ = cheerio.load(html); // html load

  product_name = $("meta[property='og:description']").attr('content');
  price = $("meta[property='eg:originalPrice']").attr('content');
  sale_price = $("meta[property='eg:salePrice']").attr('content');
  shop_name = $("meta[property='og:site_name']").attr('content');
  shop_url = url;
  img_url = $("meta[property='og:image']").attr('content');

  const new_product = {
    product_name: product_name,
    price: price,
    sale_price: sale_price,
    shop_name: shop_name,
    shop_url: shop_url,
    img: img_url,
  };

  return new_product;
}

// 무신사
function musinsa(html, url) {
  let shop_name, shop_url, img_url, product_name, price, sale_price;
  const $ = cheerio.load(html); // html load

  product_name = $(
    '#page_product_detail > div.right_area.page_detail_product > div.right_contents.section_product_summary > span > em',
  ).text();
  price = $('#goods_price').text().trim();
  console.log(price);
  // price parsing - e.g. 110,000원 -> 110000
  price = Number(
    price
      .slice(0, -1)
      .split(',')
      .reduce((a, b) => a + b),
  );

  sale_price = $(
    '#sPrice > ul > li > span.txt_price_member.m_list_price',
  ).text();
  console.log(sale_price);
  sale_price = Number(
    sale_price
      .slice(0, -1)
      .split(',')
      .reduce((a, b) => a + b),
  );
  shop_name = 'Musinsa';
  shop_url = url;
  img_url = $("meta[property='og:image']").attr('content');

  const new_product = {
    product_name: product_name,
    price: Number(price),
    sale_price: sale_price,
    shop_name: shop_name,
    shop_url: shop_url,
    img: img_url,
  };
  console.log(new_product);
  return new_product;
}

// seoul store
function brandi(html, url) {
  let shop_name, img_url, product_name, price, sale_price;
  const $ = cheerio.load(html); // html load

  shop_name = '브랜디';
  shop_url = url;
  img_url = $("meta[property='og:image']").attr('content');
  product_name = $(
    '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail_title_area > h1',
  ).text();
  price = $(
    '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail-price-wrapper.hideFinalPriceSection > div > div > span > span',
  ).text();
  price = Number(price.split(',').reduce((a, b) => a + b));
  sale_price = $(
    '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail-price-wrapper.hideFinalPriceSection > div > div > em > span',
  ).text();
  sale_price = Number(sale_price.split(',').reduce((a, b) => a + b));

  const new_product = {
    product_name: product_name,
    price: price,
    sale_price: sale_price,
    shop_name: shop_name,
    shop_url: shop_url,
    img: img_url,
  };
  console.log(new_product);

  return new_product;
}

// 상품 파싱
async function parse_product(url) {
  let new_product;
  console.log(url);
  const split_url = url.split('/');
  const cur_shop = split_url[2];
  // 서비스 가능한 사이트만 req 요청 보내기
  if (
    ['www.wconcept.co.kr', 'store.musinsa.com', 'www.brandi.co.kr'].includes(
      cur_shop,
    )
  ) {
    await axios
      .get(url)
      .then((dataa) => {
        const html = dataa.data;
        switch (cur_shop) {
          case 'www.wconcept.co.kr':
            new_product = w_concept(html, url);
            break;
          case 'store.musinsa.com':
            new_product = musinsa(html, url);
            break;
          case 'www.brandi.co.kr':
            new_product = brandi(html, url);
            break;
          default:
            break;
        }
      })
      .catch(
        // 리퀘스트 실패 - then 보다 catch 가 먼저 실행됨..
        console.log('get shopping mall html request is failed'),
      );
  }
  return new_product;
}

// 함께 쇼핑(외부) : 공유 위시리스트 넣기
// url : www.moba.com/room/{socketid}/wishlist
// method : post
// data : 함께 쇼핑(내부) url을 파싱한 정보(쇼핑몰 url, 쇼핑몰 명, 상품 이미지, 상품명, 가격, 룸 넘버)
roomRouter.post('/:id/wishlist', async (req, res) => {
  console.log(`insert product to wishlist`);
  console.log(req.body);
  if (req.body.url === undefined) {
    res.send('do not sent empty');
    return;
  }
  const new_product = await parse_product(req.body.url);

  // 연속으로 같은 제품 추가하려고 하는거 막기
  const wishlist = await sharedWishList.findOne({
    room_info: req.wishlist.room_info,
  });
  const flag = await input_product(
    wishlist,
    req.wishlist.room_info,
    new_product,
  );
  console.log(flag);
  if (flag) {
    console.log(new_product);
    res.statusCode = 201;
    res.send(new_product);
  } else {
    res.statusCode = 409;
    res.send(`this product is already in wishlist`);
  }
});

// 함께 쇼핑(외부) : 공유 위시리스트 보기
// url : [www.moba.com/](http://www.moba.com/)room/{socketid}/wishlist
// method : get
roomRouter.get('/:id/wishlist', (req, res) => {
  console.log(`products in wishlist ${req.wishlist.products}`);
  res.send(req.wishlist.products);
});

// delete helper
async function deleteProduct(products, room_info, del_product) {
  const new_products = products?.filter(
    (product) => product.shop_url !== del_product.shop_url,
  );
  await sharedWishList.updateOne(
    { room_info: room_info },
    {
      $set: {
        products: new_products,
      },
    },
  );
}

// 함께 쇼핑(외부) : 공유 위시리스트에 상품 삭제
// url : http://www.moba.com/room/{socketid}/wishlist
// method: delete
// data: 상품명 or id
roomRouter.delete('/:id/wishlist', async (req, res) => {
  console.log('delete the selected products');

  if (req.wishlist && req.body) {
    await deleteProduct(
      req.wishlist.products,
      req.wishlist.room_info,
      req.body,
    );
    res.send('delete the selected products');
  } else {
    res.send('No room No delete ');
  }
});

// TODO : 함께 쇼핑 종료시 유저의 위시리스트에 공유위시리스트 품목 넣기 + 공유 위시리스트 삭제

module.exports = roomRouter;
