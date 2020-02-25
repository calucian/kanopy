"use strict";

const _ = require('lodash');
const jsdocRestApi = require('jsdoc-rest-api');

/**
 * A class for handling Api Controllers.
 */
class ApiDispatcher
{

    /**
     * Initialize properties.
     */
    constructor (app, appServices, container) {
        this.app = app;
        this.container = container;
        this.appServices = appServices;

        this.controllers = {};
    }

    /**
     * Reads application config files and creates all Commands which can be triggered from CLI.
     *
     * @returns {ApiDispatcher}
     */
    init (controllerPath) {
        this.appServices.forEach((service) => {
            service.inject(this.app);
        });

        this.initControllers(controllerPath);

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

    initControllers (controllerPath) {
        // Assuming you've defined all of your API controllers in `server/api/**`
        let allApiEndpointsGrouped = jsdocRestApi.generateRoutes({
            source: controllerPath + "/**/*Action.js"
        });


        _(allApiEndpointsGrouped).each((controller) => {
            let controllerObj = new (require(controllerPath + '/../' + controller.fileAbsolutePath))(this.container);

            _(controller.routes).each((routes, method) => {
                _(routes).each((route) => {
                    this.app[method.toLowerCase()](route.path, async (request, response) => {
                        const module = route.ctrlClass;
                        const action = route.ctrl;

                        if (!this.controllers[module]) {
                            this.controllers[module] = controllerObj;
                        }

                        if (route.bodyObj) {
                            _(route.bodyObj).each((value, key) => {
                                request.params[key] = value;
                            });
                        }

                        try {
                            let a = await controllerObj[action](request, response);
                        }
                        catch (error) {
                            response.send({
                                status: "error",
                                error: error
                            })
                        }
                    });
                });
            });
        });
    }
}


module.exports = ApiDispatcher;
