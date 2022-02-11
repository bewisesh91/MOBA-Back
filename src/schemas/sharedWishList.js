const mongoose = require('mongoose');

const { Schema } = mongoose;
const wishListSchema = new Schema({
  room_info: Number,
  products: [
    {
      product_name: String,
      price: Number,
      shop_name: String,
      shop_url: String,
      img: String,
    },
  ],
});

module.exports = mongoose.model('sharedWishList', wishListSchema);
