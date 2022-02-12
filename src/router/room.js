const express = require('express');
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
    // collection에 위시리스트 없으면(초기진입 상황) 생성, delete 메소드일때는 생성하지 않는다.
    if (!wishlist && req.method !== 'DELETE') {
      console.log('Not Found Wishlist make new wishlist');
      wishlist = await sharedWishList.insertMany({
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
  } else {
    // TODO : 중복 알람 res로 보내기
  }
}

// 함께 쇼핑(외부) : 공유 위시리스트 넣기
// url : www.moba.com/room/{socketid}/wishlist
// method : post
// data : 함께 쇼핑(내부) url을 파싱한 정보(쇼핑몰 url, 쇼핑몰 명, 상품 이미지, 상품명, 가격, 룸 넘버)
roomRouter.post('/:id/wishlist', (req, res) => {
  console.log(`insert product to wishlist`);
  console.log(req.body);
  input_product(req.wishlist, req.params.id, req.body);
  res.send(`insert product to wishlist`);
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
  console.log(req.body);
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
