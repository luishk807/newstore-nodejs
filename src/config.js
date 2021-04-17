require('dotenv').config();

const config = {
  express: {
    port: process.env.PORT || 5000,
    whitelist: ['http://localhost:3000','http://localhost:8080','https://avenidaz.herokuapp.com/', 'https://avenidaz.com', 'http://avenidaz.com', 'http://www.avenidaz.com', 'https://www.avenidaz.com'],
  },
  db: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    host: process.env.PGHOST,
    databse: process.env.PGDATABASE
  },
  authentication: {
    authToken: process.env.TOKEN_SECRET
  },
  s3: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
    bucketName: process.env.AWS_BUCKET_NAME
  },
  sendGrid: {
    key: process.env.SENDGRID_API_KEY
  },
  email: {
    contact: 'info@avenidaz.com',
    sales: 'ventas@avenidaz.com',
    dev: 'luis@avenidaz.com',
    noReply: 'no-reply@avenidaz.com',
  },
  defaultLimit: 30,
  taxTotal: 0.07
};

module.exports = config;
