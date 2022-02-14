const PORT = 3000;
const express = require('express');
const app = express();
app.use(express.json()); // or body-parser 사용

const connect = require('./schemas');

// react 서버와 연결 가능하게
const cors = require('cors');
app.use(cors());

connect();

const roomRouter = require(`./router/room`);
const shopsRouter = require(`./router/shops`);

//파싱을 위한 임시 라우터
// const parsingRouter = require(`./html_parsing`);

//room 에서 발생하는 라우팅은 /rooms
app.use('/room', roomRouter);
//shop 에서 발생하는 라우팅은 /shops
app.use('/shops', shopsRouter);
// app.use('/parsing', parsingRouter);

// 인자가 4개면 에러
app.use((err, req, res, next) => {
  res.statusCode = err.statusCode || 500;
  res.send(err.message);
});

app.listen(PORT, () => {
  console.log(`The Express server is listening at port: ${PORT}`);
});
