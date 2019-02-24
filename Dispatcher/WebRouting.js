"use strict";

const fs = require("fs");
const _ = require("underscore");
const yaml = require("js-yaml");


const Errors = require("../Errors");

/**
 * A class for mapping CLI commands with their .js file
 */
class Routing {

    /**
     * Initialize properties.
     */
    constructor (app, basePath, container) {
        let config = container.get('config');

        this.app = app;
        this.container = container;

        this.controllers = {};

        this.initControllers(basePath + '/apps/'+ config.get('application') +'/modules/');
        this.initRoutes(basePath + '/apps/'+ config.get('application') +'/config/routes.yml');
    }

    initControllers (controllerPath, name) {
        fs
            .readdirSync(controllerPath)
            .forEach((file) => {
                if (fs.statSync(controllerPath + '/' + file).isDirectory()) {
                    return this.initControllers(controllerPath + '/' + file, name || file);
                }

                if (!file.match(/.js$/)) {
                    return;
                }

                this.controllers[name] = new (require(controllerPath + '/' + file))(this.container);
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
                this.app[method.toLowerCase()](key + "_" + method.toLowerCase(), prefix + obj.pattern, async (request, response) => {
                    const module = obj.module || request.params.module;
                    const action = obj.action || request.params.action;

                    let c = this.controllers[module];
                    let controllerFunction = c[action + "Controller"];

                    if (!controllerFunction) {
                        throw new Error('No controller found for ' + obj.controller);
                    }

                    try {
                        let a = await c[action + "Controller"](request, response);
                    }
                    catch (error) {
                        if (error instanceof Errors.NotFoundException) {

                        }
                        console.log(error);

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

module.exports = Routing;