"use strict";

/**
 * A class for handling Commands.
 */
class ApiDispatcher {

    /**
     *
     * @param app
     * @param appServices
     */
    constructor (app, appServices) {
        this.app = app;

        this.appServices = appServices;
    }

    /**
     * Reads application config files and creates all Commands which can be triggered from CLI.
     *
     * @returns {ApiDispatcher}
     */
    init () {
        this.appServices.forEach((service) => {
            service.inject(this.app);
        });

        return this;
    }

    /**
     * Attempts to execute a Command from CLI arguments.
     *
     * @returns {ApiDispatcher}
     * @see https://www.npmjs.com/package/commander
     */
    listen (port) {
        port = port || 3000;

        this.app.listen(port);

        return this;
    }
}

module.exports = ApiDispatcher;