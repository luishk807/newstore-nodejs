const config = require('./config');
const app = require('./app.js');

app.listen(config.express.port, function () {
  console.log(`Example app listening on port ${config.express.port}!`);
});