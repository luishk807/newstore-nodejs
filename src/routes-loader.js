const fs = require('fs');
const path = require('path');

const routesLoader = (app, directory) => {
    if (app && directory) {
        loadRoutesOnExpressApp(app, directory);
    } else {
        logger.error('No express app provided or routes directory');
    }
}

// Get the routes from the given routes directory, only one level
const loadRoutesOnExpressApp = (app, directory) => {
    const routesRootPath = path.join(__dirname, directory);
    logger.info(`Auto loading routes from ${directory}`);
    logger.info('API endpoint => route directory');
    fs.readdirSync(routesRootPath).forEach(f => {
        const routesDirs = [];
        if (fs.lstatSync(path.resolve(routesRootPath, f)).isDirectory()) {
            routesDirs.push(f);
        }
        // Go through each of the directories inside routes
        routesDirs.forEach(rd => {
            // Converts camelCase into camel-case
            const formattedRoute = rd.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
            const routeDir = `${directory}/${rd}`;
            logger.info(`/${formattedRoute} => ${routeDir}`);
            app.use(`/${formattedRoute}`, require(routeDir));
        });
    });
}

module.exports = routesLoader;
