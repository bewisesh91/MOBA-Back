const express = require('express');
const req = require('express/lib/request');
const roomRouter = express.Router();
const sharedWishList = require('../schemas/sharedWishList');

//not allowed
roomRouter.get('/', (req, res) => {
  res.send('this is not rightful access');
});

//room id로 room 별 공유 위시리스트를 req에 넣는다
roomRouter.param('id', async (req, res, next, value) => {
  try {
    console.log(value);
    let wishlist = await sharedWishList.findOne({ room_info: value });
    // collection에 위시리스트 없으면(초기진입 상황) 생성, delete일때는 생성하지 않는다.
    if (!wishlist && req.method !== 'DELETE') {
      console.log('Not Found Wishlist make new wishlist');
      wishlist = await sharedWishList.insertMany({
        room_info: value,
        // this is tmp dumy data, products list will be empty list
        products: [
          {
            product_name: '에어조던1 미드 멘즈 레드 화이트 BQ6472-161',
            price: 269000,
            shop_name: 'Musinsa',
            shop_url: 'https://store.musinsa.com/app/goods/2335533',
            img: 'https://image.msscdn.net/images/goods_img/20220127/2335533/2335533_1_500.jpg',
          },
          {
            product_name: '에어조던2 미드 멘즈 레드 화이트 BQ6472-161',
            price: 269000,
            shop_name: 'Musinsa',
            shop_url: 'https://store.musinsa.com/app/goods/2335533',
            img: 'https://image.msscdn.net/images/goods_img/20220127/2335533/2335533_1_500.jpg',
          },
        ],
      });
      // console.log(wishlist);
    }
    req.wishlist = wishlist;
    console.log(wishlist);
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

// 더미 품목 넣기
async function test_input(room_info) {
  await sharedWishList.updateOne(
    { room_info: room_info },
    {
      $addToSet: {
        // this is tmp dumy data, front-end will give rightful data
        products: {
          product_name: '에어조던6 미드 멘즈 레드 화이트 BQ6472-161',
          price: 269000,
          shop_name: 'Musinsa',
          shop_url: 'https://store.musinsa.com/app/goods/2335533',
          img: 'https://image.msscdn.net/images/goods_img/20220127/2335533/2335533_1_500.jpg',
        },
      },
    },
  );
}

// 함께 쇼핑(외부) : 공유 위시리스트 넣기
// url : www.moba.com/room/{socketid}/wishlist
// method : post
// data : 함께 쇼핑(내부) url을 파싱한 정보(쇼핑몰 url, 쇼핑몰 명, 상품 이미지, 상품명, 가격, 룸 넘버)
roomRouter.post('/:id/wishlist', (req, res) => {
  console.log(`insert product to wishlist`);
  test_input(req.wishlist.room_info);
  res.send(`insert product to wishlist`);
});

// 함께 쇼핑(외부) : 공유 위시리스트 보기
// url : [www.moba.com/](http://www.moba.com/)room/{socketid}/wishlist
// method : get
roomRouter.get('/:id/wishlist', (req, res) => {
  console.log(`products in wishlist ${req.wishlist.products}`);
  res.send(`products in wishlist: ${JSON.stringify(req.wishlist.products)}`);
});

// delete helper
async function deleteProduct(room_info) {
  await sharedWishList.updateOne(
    { room_info: room_info },
    {
      $pull: {
        products: {
          // this is tmp dumy data, front-end will give rightful data
          product_name: '에어조던6 미드 멘즈 레드 화이트 BQ6472-161',
        },
      },
    },
  );
}

// 함께 쇼핑(외부) : 공유 위시리스트에 상품 삭제
// url : http://www.moba.com/room/{socketid}/wishlist
// method: delete
// data: 상품명 or id
roomRouter.delete('/:id/wishlist', (req, res) => {
  console.log('delete the selected products');
  if (req.wishlist) {
    deleteProduct(req.wishlist.room_info);
    res.send('delete the selected products');
  } else {
    res.send('No room No delete ');
  }
});

// TODO: 함께 쇼핑 종료시 유저의 위시리스트에 공유위시리스트 품목 넣기 + 공유 위시리스트 삭제

module.exports = roomRouter;
