const PORT = 3000;
const app = require('./app');

app.listen(PORT, () => {
  console.log(`The Express server is listening at port: ${PORT}`);
});
