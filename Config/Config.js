"use strict";

/**
 * A class for handling application configuration
 */
class Config
{
    /**
     * Initializes `config` property
     * @see https://www.npmjs.com/package/dotenv
     */
    constructor () {
        var dotenv = require("dotenv");

        this.config = dotenv.config().parsed;

        console.log(this.config);
    }

    /**
     * Get value of a configuration property.
     *
     * @param {String} fieldName Name of property to retrieve.
     *
     * @returns {*}
     */
    get (fieldName) {
        return this.config[fieldName];
    }

    /**
     * Set the value for a config property
     *
     * @param {String}  fieldName
     * @param {*}       value
     */
    set (fieldName, value) {
        this.config[fieldName] = value;
    }
}

module.exports = Config;