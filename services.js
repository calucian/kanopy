"use strict";

const ExpressInjector = require("./Lib/ExpressInjector");

/**
 * A wrapper for instantiating all Services from src/Framework/Services.
 *
 * @param {Container} container
 *
 * */
const services = function (container) {
    return {
        "config": function () {
            return new (require("./Services/Config"))();
        },
        "routing": function () {
            const Service = require("./Services/Routing");

            return new Service();
        },
        "express": function () {
            const express = require("express");

            return express();
        },
        "express.security" : function () {
            return new ExpressInjector((app) => {
                const Security = require("./Security/BasicSecurityUser");
                const MemoryStorage = require("./Security/Storage/Memory");

                app.use((req, res, next) => {
                    req.security = new Security(new MemoryStorage());
                    req.security.loadAttributes(req.headers.session)
                        .then(() => next());
                });
            });
        },
        /* "express.reverse": function () {
            return new ExpressInjector((app) => {
                const expressReverse = require("express-reverse");

                expressReverse(app);
            });
        },*/
        "express.body-parser": function () {
            return new ExpressInjector((app) => {
                const bodyParser = require("body-parser");

                app.use(bodyParser.json());
                app.use(bodyParser.urlencoded({ extended: false }));
            });
        },
        /* "express.cors": function () {
            return new ExpressInjector((app) => {
                const cors = require("cors");

                app.use(cors());
            });
        },*/
        "express.routing": function () {
            return new ExpressInjector((app) => {
                const Routing = require("./Dispatcher/WebRouting");

                new Routing(
                    app,
                    container.get("config").get("app.basePath"),
                    container
                );
            });
        },
        /*"express.twig": function () {
            return new ExpressInjector((app) => {
                app.set('views', container.get("config").get("app.basePath") + '/app/views');
                app.set('view engine', 'twig');
            });
        },*/
        "dispatcher.api": function () {
            const Dispatcher = require("./Services/ApiDispatcher");

            return new Dispatcher(
                container.get("express"),
                container.getGroup("express"),
                container
            );
        },
        "dispatcher.cli": function () {
            var Service = require("./Services/CliDispatcher");

            return new Service(
                container.get("routing"),
                container
            );
        },
        "logger": function () {
            var Service = require("./Services/Logger");

            return new Service (
                container.get("config")
            );
        }
    };
};

module.exports = services;