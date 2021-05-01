// Setup global logger first
const logger = require('./utils/logger');
global.logger = logger;

const config = require('./config');
const app = require('./app.js');

// Below override is required due to express not able to parse BigInt using JSON.stringify.
// Since prisma uses BigInt, which NodeJS supports, but it is still not supported officially 
// on JSON.stringify, so when the express API returns any object value by running JSON.stringify
// when it gets to a BigInt type, it will just throw an exception, something like that.
/**
 * Workaround regarding JSON.stringify not being able to parse BigInt
 * @returns string
 */
BigInt.prototype.toJSON = function() {
  return this.toString()
}

app.listen(config.express.port, function () {
  console.log(`Example app listening on port ${config.express.port}!`);
});
