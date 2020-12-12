const config = require('../config');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey
});

module.exports = s3;
