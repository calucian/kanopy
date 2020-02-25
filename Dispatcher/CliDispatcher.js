"use strict";

const fs = require("fs");
const program = require("../Command/Commander");


/**
 * A class for handling Commands.
 */
class CliDispatcher {

    /**
     * Initialize properties.
     *
     * @param {Routing}     routing
     * @param {Container}   container
     *
     * See {@link Routing} and {@link Container}
     */
    constructor (container) {
        this.commands   = [];
        this.container  = container;
    }

    /**
     * Reads application config files and creates all Commands which can be triggered from CLI.
     *
     * @returns {CliDispatcher}
     */
    init (path) {
        let files = this.readDir(path);

        files.forEach((route) => {
            let Command = require(route);
            this.commands.push(new Command(program, this.container));
        });

        return this;
    }

    readDir (commandsPath) {
        let files = [];

        fs.readdirSync(commandsPath).forEach((file) => {
            let stats = fs.statSync(commandsPath + file);

            if (stats.isDirectory()) {
                files = [...files, ...this.readDir(commandsPath + file + "/")];
            }

            if (!/(.*?)Task\.js$/i.test(file)) {
                return;
            }

            files.push(commandsPath + file);
        });

        return files;
    }

    /**
     * Attempts to execute a Command from CLI arguments.
     *
     * @returns {CliDispatcher}
     * @see https://www.npmjs.com/package/commander
     */
    parse () {
        program.parse(process.argv);

        return this;
    }
}

module.exports = CliDispatcher;
