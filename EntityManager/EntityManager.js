"use strict";

/**
 * A class for managing connections to databases.
 * See usage {@link MySQL#getEntityManager}
 */
class EntityManager
{
    /**
     * Create a new EntityManager
     *
     * @param {Object} connection A MySQL connection to database
     * @param {String} storePath
     */
    constructor (connection, storePath) {
        this.cache      = {};
        this.connection = connection;
        this.storePath  = storePath;
    }

    /**
     * Fetch a Store from the current EM
     *
     * @param   {String} name The name of the store to retrieve
     * @returns {*}
     */
    getStore (name) {
        if (this.cache[name] === undefined) {
            this.cache[name] = new (require(this.storePath + name))(this.connection);
        }

        return this.cache[name];
    }

    /**
     * Return the current connection object
     *
     * @returns {MySQL}
     */
    getConnection () {
        return this.connection;
    }

    /**
     * Start a transaction
     *
     * @param {Function} callback
     */
    transactional (callback) {
        this.connection.getConnection((error, connection) => {
            if (error) {
                return callback(error);
            }

            connection.beginTransaction((error) => {
                if (error) {
                    return callback(error);
                }

                callback(error, new EntityManager(connection, this.storePath));
            });
        });
    }


    /**
     * Rollback transaction
     *
     * @param {Function} callback
     */
    rollbackTransaction (callback) {
        this.connection.rollback (() => {
            this.connection.release();

            callback();
        });
    }

    /**
     * Tries to run and save the transaction, it will rollback the transaction on error
     *
     * @param {Function} callback
     */
    commitTransaction (callback) {
        this.connection.commit((error) => {
            if (error) {
                return this.connection.rollback(() => {
                    this.connection.release();

                    callback(error);
                });
            }

            this.connection.release();
            callback(error);
        });
    }
}

module.exports = EntityManager;