"use strict";

const fs = require('fs');
const DocBlock = require('docblock');

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

    /**
     *
     *
     * @param controllerPath
     * @param name
     */
    initControllers (controllerPath, name) {
        let docBlock = new DocBlock();

        fs
            .readdirSync(controllerPath)
            .forEach((file) => {
                if (fs.statSync(controllerPath + '/' + file).isDirectory()) {
                    return this.initControllers(controllerPath + '/' + file, name || file);
                }

                if (!file.match(/.js$/)) {
                    return;
                }

                let source = fs.readFileSync(controllerPath + '/' + file);

                let result = docBlock.parse(source, 'js');

                result.forEach((action) => {
                    if (action.tags && (action.tags.Route || action.tags.route)) {
                        let route = action.tags.Route || action.tags.route;

                        this.app[method.toLowerCase()](prefix + obj.pattern, async (request, response) => {
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
                    }
                });

                this.controllers[name] = new (require(controllerPath + '/' + file))(this.container);
            });
    }



    initRoutes (file, prefix) {
        prefix = prefix || '';

        this.app.get("/test", (req, res) => {
            res.send({
                query: req.query
            })
        })

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


module.exports = ApiDispatcher;