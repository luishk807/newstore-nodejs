const crypto = require("crypto");
const config = require('../config');

const getSignature = async(data) => {
  return sign(data);
}

function sign(fields) {
  const hash = crypto.createHmac("sha256", config.stGeorgeBank.ACCESS_KEY);
  const encodedFields = Object.keys(fields).sort().map(k => `${k}=${fields[ k ]}`).join(",");
  return hash.update(encodedFields).digest("base64");
}


module.exports = {
  getSignature
}