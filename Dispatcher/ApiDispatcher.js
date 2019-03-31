"use strict";

const fs = require('fs');
const _ = require("underscore");
const yaml = require("js-yaml");

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

    initControllers (controllerPath, name) {
        name = name || "";

        fs
            .readdirSync(controllerPath)
            .forEach((file) => {
                if (fs.statSync(controllerPath + '/' + file).isDirectory()) {
                    return this.initControllers(controllerPath + '/' + file, name || file);
                }

                if (file === "routes.yml") {
                    this.initRoutes(controllerPath + '/' + file);
                }

                if (!file.match(/Actions\.js$/)) {
                    return;
                }

                this.controllers[file.replace('Actions.js', '')] = new (require(controllerPath + '/' + file))(this.container);
            });
    }

    initRoutes (file, prefix) {
        prefix = prefix || '';

        let routesYaml = yaml.safeLoad(fs.readFileSync(file, 'utf8'));

        _(routesYaml).each((obj, key) => {
            if (obj.resource) {
                return this.initRoutes(path.dirname(file) + '/' + obj.resource, obj.prefix);
            }

            if (!obj.methods) {
                throw new Error('No methods defined for controller ' + obj.controller);
            }

            obj.methods.forEach((method) => {
                this.app[method.toLowerCase()](prefix + obj.pattern, async (request, response) => {
                    const module = obj.module || request.params.module || "";
                    const action = obj.action || request.params.action;

                    let c = this.controllers[module];
                    let controllerFunction = c[action + "Controller"];

                    if (!controllerFunction) {
                        throw new Error('No controller found for ' + obj.controller);
                    }

                    if (obj.params) {
                        _(obj.params).each((value, key) => {
                            request.params[key] = value;
                        });
                    }

                    try {
                        let a = await c[action + "Controller"](request, response);
                    }
                    catch (error) {
                        response.send({
                            status: "error",
                            error: error.message
                        })
                    };

                });
            });
        });
    }
}


module.exports = ApiDispatcher;