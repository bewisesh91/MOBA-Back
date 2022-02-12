const mongoose = require('mongoose');

const connect = () => {
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }
  mongoose.connect(
    'mongodb://localhost:27017/tmpWishList',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, - 몽구스 6에서 삭제된 옵션 넣으면 안됨
    },
    (error) => {
      if (error) {
        console.log('mongoDB connection error', error);
      } else {
        console.log('mongoDB connection success');
      }
    },
  );
};

mongoose.connection.on('error', (error) => {
  console.error('mongoDB connection error', error);
});
mongoose.connection.on('disconnected', () => {
  console.error('mongoDB is disconnected. retry to connect MongoDB.');
  connect();
});

module.exports = connect;
