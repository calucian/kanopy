"use strict";

let winston = require("winston");

/**
 * A logging service class.
 * @class
 */
class Logger {
    
    /**
     * Creates a `bunyan` logger.
     * When "NODE_ENV" is equal to "development" the "stream" defaults to to process.stdout at the
     * "info" level.
     * @see https://www.npmjs.com/package/bunyan#streams
     *
     * @param {Config} config An instance of Config class.
     */
    constructor (config) {
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                //
                // - Write to all logs with level `info` and below to `combined.log`
                // - Write all logs error (and below) to `error.log`.
                //
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' })
            ]
        });

        if (config.get("NODE_ENV") !== 'production') {
            logger.add(new winston.transports.Console({
                format: winston.format.simple()
            }));
        }

        this.loggerInstance = logger;
    }

    /**
     * Process warnings from a previous MySQL INSERT query.
     *
     * @param {object} store An instance of a MySQL store.
     * @param {array} values Values that were used in the MySQL query.
     * @param {function} callback
     */
    processInsertWarnings (store, values, callback) {
        store.getWarnings((errorWarnings, resultWarnings) => {
            let reRow = /at row([ 0-9]+)/i;
            let reColumn = /column \'(.+)\'/i;

            if (errorWarnings) {
                this.warn(`${store.constructor.name}: Unable to retrieve warnings`, errorWarnings);
                return callback();
            }

            resultWarnings.forEach((warning) => {
                let message       = warning.Message;
                let matchesRow    = message.match(reRow);
                let matchesColumn = message.match(reColumn);
                let mysqlRow;
                let columnName;
                let columnValue;
                let valueEntry;
                let pkValue;

                if (matchesRow) {
                    mysqlRow = parseInt(matchesRow[1], 10);
                    valueEntry = values[mysqlRow - 1];
                    // Note: Assuming that primary key is the first entry if it is an array.
                    pkValue = valueEntry[store.pk] ? valueEntry[store.pk] : valueEntry[0];
                }

                if (matchesColumn) {
                    columnName = matchesColumn[1];
                    columnValue = valueEntry[columnName];
                }

                let pkMessage = valueEntry ? ` for key '${store.pk}' value '${pkValue}'` : "";

                if (mysqlRow && columnValue) {
                    this.warn(`INSERT warning '${store.constructor.name}'${pkMessage}. Message is '${message}'. Value for '${columnName}' was '${valueEntry[columnName]}'`);
                } else if (mysqlRow) {
                    this.warn(`INSERT warning '${store.constructor.name}'${pkMessage}. Message is '${message}'. Values used were:`, valueEntry);
                } else {
                    this.warn(`INSERT warning '${store.constructor.name}'. Message is '${message}'`);
                }
            });

            callback();
        });
    }

    /**
     * Logs using internal loggerInstance at trace level
     * @see https://www.npmjs.com/package/bunyan#log-method-api
     * @see https://www.npmjs.com/package/bunyan#levels
     *
     * @param {...*}
     */
    trace () {
        this.loggerInstance.trace.apply(this.loggerInstance, arguments);
    }

    /**
     * Logs using internal loggerInstance at debug level
     * @see https://www.npmjs.com/package/bunyan#log-method-api
     * @see https://www.npmjs.com/package/bunyan#levels
     *
     * @param {...*}
     */
    debug () {
        this.loggerInstance.debug.apply(this.loggerInstance, arguments);
    }

    /**
     * Logs using internal loggerInstance at info level
     * @see https://www.npmjs.com/package/bunyan#log-method-api
     * @see https://www.npmjs.com/package/bunyan#levels
     *
     * @param {...*}
     */
    info () {
        this.loggerInstance.info.apply(this.loggerInstance, arguments);
    }

    /**
     * Logs using internal loggerInstance at warn level
     * @see https://www.npmjs.com/package/bunyan#log-method-api
     * @see https://www.npmjs.com/package/bunyan#levels
     *
     * @param {...*}
     */
    warn () {
        this.loggerInstance.warn.apply(this.loggerInstance, arguments);
    }


    /**
     * Logs using internal loggerInstance at error level
     * @see https://www.npmjs.com/package/bunyan#log-method-api
     * @see https://www.npmjs.com/package/bunyan#levels
     *
     * @param {...*}
     */
    error () {
        this.loggerInstance.error.apply(this.loggerInstance, arguments);
    }

    /**
     * Logs using internal loggerInstance at fatal level
     * @see https://www.npmjs.com/package/bunyan#log-method-api
     * @see https://www.npmjs.com/package/bunyan#levels
     *
     * @param {...*}
     */
    fatal () {
        this.loggerInstance.fatal.apply(this.loggerInstance, arguments);
    }
}

module.exports = Logger;