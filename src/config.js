require('dotenv').config();
const configs = require('./configs');

const config = {
  express: {
    port: process.env.PORT || 5000,
    whitelist: [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://avenidaz.com', 
      'http://avenidaz.com', 
      'http://www.avenidaz.com', 
      'https://www.avenidaz.com', 
      'https://dev.avenidaz.com',
      'https://prueba.avenidaz.com',
      'http://prueba.avenidaz.com',
      'https://beta.avenidaz.com',
      'http://beta.avenidaz.com',
      'http://feature507.avenidaz.com',
      'https://feature507.avenidaz.com',
      'https://avenidaz.herokuapp.com/', 
      'https://avenidaz-beta.herokuapp.com',
      'https://avenidaz-dev.herokuapp.com',
      'https://avenidaz-master.herokuapp.com',
      'https://avenidaz-sample.herokuapp.com',
      'https://avenidaz-feature.herokuapp.com'
    ]
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
    contact: 'Avenida Z <info@avenidaz.com>',
    sales: 'Ventas - Avenida Z <ventas@avenidaz.com>',
    dev: 'luis@avenidaz.com',
    noReply: 'No-Reply - Avenida Z <no-reply@avenidaz.com>',
  },
  allowStatusEmail: [
    1, 3, 4, 9, 10, 11, 12, 13, 14
  ],
  phone: {
    main: '6770-2400'
  },
  bankAccount: {
    main: '0395011351638'
  },
  social: {
    whatssapp: 'https://wa.me/50767702400'
  },
  adminRoles: [1,3],
  defaultLimit: 30,
  taxTotal: 0.07,
  integrations: {
    quickbooks: {
      clientId: process.env.QB_CLIENT_ID,
      clientSecret: process.env.QB_SECRET,
      environment: process.env.QB_ENVIRONMENT,
      redirectUri: process.env.QB_REDIRECT_URI,
      apiVersion: process.env.QB_API_VERSION,
      apiMinorVersion: process.env.QB_API_MINOR,
      baseUrl: (process.env.QB_ENVIRONMENT === 'production') ? 'https://quickbooks.api.intuit.com' : 'https://sandbox-quickbooks.api.intuit.com',
      webhookToken: process.env.QB_WH_TOKEN
    }
  },
  queues: {
    pgBoss: {
      dbHost: process.env.QUEUE_PGBOSS_DB_HOST,
      dbPort: process.env.QUEUE_PGBOSS_DB_PORT,
      dbName: process.env.QUEUE_PGBOSS_DB_NAME,
      dbUser: process.env.QUEUE_PGBOSS_DB_USER,
      dbPwd: process.env.QUEUE_PGBOSS_DB_PWD
    }
  },
  configs: configs
};

module.exports = config;
