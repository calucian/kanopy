"use strict";

const _ = require("underscore");

/**
 * A class for managing Services.
 * See {@link 'src/Framework/services.js'} and {@link 'src/Services/services.js'}
 */
class Container {

    /**
     * Retrieves all Services.
     *
     * @param {Array} services
     */
    constructor (... services) {
        this.services = require("../services")(this);
        services.forEach((service) => {
            _.extend(this.services, service(this));
        });

        this.cache = {};
    }

    /**
     * Retrieves an instance of a Service from cache, if it was already instantiated, or
     * instantiates one if it is retrieved for the first time.
     *
     * @param   {String} service
     *
     * @returns {*}
     * @throws  {Error} Will throw an error if given service does not exist in `services` property.
     */
    get (service) {
        if (this.services[service] === undefined) {
            throw Error("Undefined service " + service);
        }

        if (this.cache[service] === undefined) {
            this.cache[service] = this.services[service]();
        }

        return this.cache[service];
    }

    /**
     * Get all services matching groupName.*
     *
     * @param groupName
     * @returns {Array}
     */
    getGroup (groupName) {
        let group = [];

        _(this.services).each((service, name) => {
            if (name.indexOf(groupName + ".") === 0) {
                group.push(this.get(name));
            }
        });

        return group;
    }

    /**
     * (Re)Define a service.
     *
     * @param {String}  name
     * @param {*}       service
     */
    set (name, service) {
        this.services[name] = service;
    }
}

module.exports = Container;
