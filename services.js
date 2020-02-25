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
        "express.body-parser": function () {
            return new ExpressInjector((app) => {
                const bodyParser = require("body-parser");

                app.use(bodyParser.json());
                app.use(bodyParser.urlencoded({ extended: false }));
            });
        },
        "dispatcher.api": function () {
            const Dispatcher = require("./Dispatcher/ApiDispatcher");

            return new Dispatcher(
                container.get("express"),
                container.getGroup("express"),
                container
            );
        },
        "dispatcher.cli": function () {
            var Service = require("./Dispatcher/CliDispatcher");

            return new Service(
                container
            );
        },
        "logger": function () {
            var Service = require("./Logger/Logger");

            return new Service (
                container.get("config")
            );
        }
    };
};

module.exports = services;
