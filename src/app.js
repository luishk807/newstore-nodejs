const express = require('express');
const bodyParser = require('body-parser');
const configOAuth = require('./oauth');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
// const cors = require('cors');
const routesLoader = require('./routes-loader');
// const app = express();

// app.use(bodyParser.urlencoded({ extended: true } ));
// app.use(bodyParser.json({ limit: '5mb' }));

// // Still need to configure app.oauth.authorize() middleware in routes, seems like tricket to make this app.oauth.authoerize() available in routes
// // configOAuth(app);

// routesLoader(app, './routes');
// app.use(cors());
// app.options('*', cors());


const logger = require('./utils/logger');
global.logger = logger;

const config = require('./config');



app
  .prepare()
  .then(() => {

    const server = express();

    server.use(bodyParser.urlencoded({ extended: true } ));
    server.use(bodyParser.json({ limit: '5mb' }));

    // Still need to configure app.oauth.authorize() middleware in routes, seems like tricket to make this app.oauth.authoerize() available in routes
    // configOAuth(app);

    routesLoader(server, './routes');

    server.use((req, res, next) => {
      const hostname = req.hostname === 'dev.avenidaz.com' ? 'dev.avenidaz.com' : req.hostname;

      if (req.headers['x-forwarded-proto'] === 'http' || req.hostname === 'dev.avenidaz.com') {
        res.redirect(301, `https://${hostname}${req.url}`);
        return;
      }

      res.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload');
      next();
    });

    server.get('*', (req, res) => handle(req, res));

    // server.listen(
    //   4242,
    //   error => {
    //     if (error) throw error;
    //     console.error('Listening on port 4242');
    //   }
    // );


    BigInt.prototype.toJSON = function() {
      return this.toString()
    }
    
    server.listen(config.express.port, function () {
      console.log(`AvenidaZ server listening on port ${config.express.port}!`);
    });

    

  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });



module.exports = app
