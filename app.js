const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get("/admin/products", (req, res, next) => {
  res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});