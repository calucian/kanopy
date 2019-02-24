"use strict";

var program = require("../Commander/Commander");

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
    constructor (routing, container) {
        this.commands   = [];
        this.container  = container;
        this.routing    = routing;
    }

    /**
     * Reads application config files and creates all Commands which can be triggered from CLI.
     *
     * @returns {CliDispatcher}
     */
    init () {
        this.routing.readDir(
            global.BASE_DIR + "src/Command/"
        );

        this.routing.getAll().forEach((route) => {
            let Command = require(route);
            this.commands.push(new Command(program, this.container));
        });

        return this;
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