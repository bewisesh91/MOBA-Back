const express = require('express');

const shopsRouter = express.Router();

// 함께 쇼핑(내부) : 초기
// url : www.moba.com/shops
// method : get
shopsRouter.get('/', (req, res) => {
  console.log("shoplists")
  res.send("listing user's favorite sites");
});

module.exports = shopsRouter;
