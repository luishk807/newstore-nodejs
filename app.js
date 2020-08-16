const express = require('express');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 5000;

var whitelist = ['http://localhost:3000'];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

//app.use(cors())

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get("/admin/products", cors(corsOptions), function (req, res, next) {
  res.json(["Tony","Lisa","Michael","Ginger","Food"])
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});