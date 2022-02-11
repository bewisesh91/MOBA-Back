const express = require('express');
// const morgan = require('morgan');
const app = express();
app.use(express.json()); // or body-parser 사용
const connect = require('./schemas');
connect();

const roomRouter = require(`./routers/room`);
const shopsRouter = require(`./routers/shops`);

//room 에서 발생하는 라우팅은 /rooms
app.use('/room', roomRouter);
//shop 에서 발생하는 라우팅은 /shops
app.use('/shops', shopsRouter);

app.use((err, req, res, next) => {
  // 인자가 4개면 에러인지 안다
  res.statusCode = err.statusCode || 500;
  res.send(err.message);
});

module.exports = app;
