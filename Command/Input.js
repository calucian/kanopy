"use strict";

/**
 * A class for handling user input given to a Command.
 * See {@link Command} and {@link Command#run}.
 */
class Input {

    /**
     * Initializes properties of class.
     */
    constructor () {
        this.arguments = {};
        this.options = {};
    }

    /**
     * Adds another entry in `arguments` Object property.
     *
     * @param {String}  name
     * @param {*}       value
     */
    setArgument (name, value) {
        this.arguments[name] = value;
    }

    /**
     * Retrieves an argument's value.
     *
     * @param {String}  name         The name of the argument who's value to return.
     * @param {*}       defaultValue The default value to be returned
     *
     * @returns {*}
     */
    getArgument (name, defaultValue) {
        return this.arguments[name] ? this.arguments[name] : defaultValue;
    }

    /**
     * Adds another entry in `options` Object property.
     *
     * @param {String}  name
     * @param {*}       value
     */
    setOption (name, value) {
        this.options[name] = value;
    }

    /**
     * Retrieves an options's value.
     *
     * @param {String}  name         The name of the option who's value to return.
     * @param {*}       defaultValue The default value to be returned
     *
     * @returns {*}
     */
    getOption (name, defaultValue) {
        return this.options[name] ? this.options[name] : defaultValue;
    }
}

module.exports = Input;