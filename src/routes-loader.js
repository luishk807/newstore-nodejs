const fs = require('fs');
const path = require('path');

const routesLoader = (app, directory) => {
    if (app && directory) {
        loadRoutesOnExpressApp(app, directory);
    } else {
        console.error('No express app provided or routes directory');
    }
}

// Get the routes from the given routes directory, only one level
const loadRoutesOnExpressApp = (app, directory) => {
    const routesRootPath = path.join(__dirname, directory);
    console.log(`Auto loading routes from ${directory}`);
    fs.readdirSync(routesRootPath).forEach(f => {
        const routesDirs = [];
        if (fs.lstatSync(path.resolve(routesRootPath, f)).isDirectory()) {
            routesDirs.push(f);
        }
        // Go through each of the directories inside routes
        routesDirs.forEach(rd => {
            const routeDir = `${directory}/${rd}`;
            console.log(`${routeDir}`);
            app.use('/', require(routeDir));
        });
    });
}

module.exports = routesLoader;
