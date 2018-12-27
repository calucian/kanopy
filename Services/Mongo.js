"use strict";


var deasync     = require("deasync");

class Mongo
{
    /**
     * Create a Mongo connection wrapper
     *
     * @param connectionString
     * @param storePath
     */
    constructor (connectionString, storePath) {

    }

    _call

    /**
     *
     * @returns {*}
     */
    getConnection () {
        return this.connection;
    }

    /**
     * Get mongo collection
     *
     * @param collection
     * @returns {Store}
     */
    collection (collection) {
        if (this.cache[collection] !== undefined) {
            return this.cache[collection];
        }

        const path  = this.storePath + collection + ".js";
        var   Store = require("../../Store/Mongo/Store");

        try {
            if (fs.accessSync(path, fs.R_OK | fs.W_OK)) {
                Store = require(path);
            }
        } catch (err) {}

        this.cache[collection] = new Store(this.connection.collection(collection.toUpperCase()));

        return this.cache[collection];
    }
}

module.exports = Mongo;