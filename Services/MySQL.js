"use strict";

const knex = require("knex");
const base = require("../Model/base");

class MySQL
{
    /**
     * Create a MySQL connection wrapper
     *
     * @param options
     */
    constructor (options) {
        this.connections = {};
        this.paths       = {};


        this.connection = knex(options);

        this.cache = {};
    }

    /**
     * Get the EntityManager for the provided connection name
     *
     * @param em
     *
     * @returns {EntityManager}
     */
    getTable (name) {
        if (this.cache[name] === undefined) {
            this.cache[name] = new base(this.connection, name);
        }

        return this.cache[name];
    }
}

module.exports = MySQL;