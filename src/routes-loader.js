const fs = require('fs');
const path = require('path');

const routesLoader = (app, directory, ignorePaths = []) => {
    if (app && directory) {
        loadRoutesOnExpressApp(app, directory, ignorePaths);
    } else {
        logger.error('No express app provided or routes directory');
    }
}

// Get the routes from the given routes directory, only one level
const loadRoutesOnExpressApp = (app, directory, ignorePaths) => {
    const routesRootRealPath = path.join(__dirname, directory);
    logger.info(`Auto loading routes from ${directory}`);
    logger.info('API endpoint => route directory');
    loadRoutesFromPath(directory, directory, routesRootRealPath, app, ignorePaths);
}

const loadRoutesFromPath = (masterDirectory, directory, routesRootRealPath, app, ignorePaths = []) => {
    logger.info(`Loading from master directory: ${masterDirectory}, directory: ${directory}, routesRootRealPath: ${routesRootRealPath}, ignorePaths: ${ignorePaths}`);
    fs.readdirSync(routesRootRealPath).forEach(f => {
        if (!ignorePaths.includes(f)) {
            const routeRealPath = path.resolve(routesRootRealPath, f);
            const isDirectory = fs.lstatSync(routeRealPath).isDirectory();
            const moduleFileRealPath = path.resolve(routesRootRealPath, f, 'index.js');
            const moduleFileExists = fs.existsSync(moduleFileRealPath);
            // Assign route if the module file exists on that directory
            if (isDirectory && moduleFileExists) {
                assignRoute(masterDirectory, directory, f, app);
            } else if (isDirectory) { // Go one level deeper
                const subDir = `${directory}/${f}`;
                loadRoutesFromPath(masterDirectory, subDir, routeRealPath, app);
            }
        } else {
            logger.info(`Ignoring [${f}] for routes auto-loading because it belongs to ignorePaths`);
        }
    });
}

const assignRoute = (masterDirectory, directory, routeDirectory, app) => {
    const routeDir = `${directory}/${routeDirectory}`;
    // Converts camelCase into camel-case
    let formattedRoute = formatRoute(routeDirectory);
    if (masterDirectory !== directory) { // Means it is not routes from the master directory, it's a subdirectory
        formattedRoute = `${formatRoute(directory.replace(`${masterDirectory}/`, ''))}/${formattedRoute}`;
    }
    logger.info(`/${formattedRoute} => ${routeDir}`);
    app.use(`/${formattedRoute}`, require(routeDir));
}

const formatRoute = (route) => {
    return route.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
}

module.exports = routesLoader;
