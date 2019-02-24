"use strict";

var fs = require("fs");

/**
 * A class for mapping CLI commands with their .js file
 */
class Routing {

    /**
     * Initialize properties.
     */
    constructor () {
        this.files = [];
    }

    /**
     * Reads config files from given paths and maps per 'routeMapping' for each configuration
     * file from `configPath` folder with the 'sourcePath' from the applicationMapping.json file
     * from `libPath`.
     *
     * @param {String} commandsPath
     *
     * {@link Dispatcher#init}
     */
    readDir (commandsPath) {
        fs.readdirSync(commandsPath).forEach((file) => {
            let stats = fs.statSync(commandsPath + file);

            if (stats.isDirectory() && file != "Base") {
                return this.readDir(commandsPath + file + "/");
            }

            if (!/(.*?)Command\.js$/i.test(file)) {
                return;
            }

            this.files.push(commandsPath + file);
        });
    }

    /**
     * Retrieve all registered routes.
     *
     * @returns {Array|*}
     */
    getAll () {
        return this.files;
    }
}

module.exports = Routing;