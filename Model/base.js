"use strict";

const _ = require("underscore");

function _mapData (item) {
    _.each(item, function (data, key) {
        if (data instanceof Date || typeof data === "number" || typeof data === "string") {
            return;
        }

        if (data === null || data === undefined) {
            item[key] = null;

            return;
        }

        if (typeof data === "boolean") {
            item[key] = data ? 1 : 0;

            return;
        }

        if (Array.isArray(data)) {
            item[key] = data.toString();

            return;
        }

        item[key] = JSON.stringify(data);
    });

    return item;
}

class Base {
    constructor (knex, tableName) {
        this.knex = knex;

        this.tableName = tableName;
    }

    _generateWhereClause (params) {
        let query = this.getQueryBuilder();

        _.each(params, function (value, key) {
            if (_.isObject(value) && value.hasOwnProperty("$in")) {
                value.$in = value.$in === undefined ? null : value.$in;

                query.whereIn(key, value.$in);
            }

            if (_.isObject(value) && value.hasOwnProperty("$gt")) {
                value.$gt = value.$gt === undefined ? null : value.$gt;

                query.where(key, ">", value.$gt);
            }

            if (_.isObject(value) && value.hasOwnProperty("$lt")) {
                value.$lt = value.$lt === undefined ? null : value.$lt;

                query.where(key, "<", value.$lt);
            }

            if (!_.isObject(value)) {
                value = value === undefined ? null : value;

                query.where(key, value);
            }
        });

        return query;
    }

    getQueryBuilder () {
        return this.knex
            .from(this.tableName);
    }

    query (...params) {
        return new Promise((resolve, reject) => {
            this.mysql.query.call(...params, (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result);
            })
        });
    }

    findOne (params) {
        if (!params) {
            return callback("No query params sent to findOne method");
        }

        return this
            ._generateWhereClause(params)
            .limit(1)
            .then((result) => {
                return result.length ? result.pop() : null;
            });
    }

    find (params) {
        if (!params) {
            return new Error("No query params sent to find method");
        }

        return this
            ._generateWhereClause(params)
            .select();
    }

    findAll () {
        return this
            .getQueryBuilder()
            .select();
    }

    count (params) {
        if (!params) {
            return new Error("No query params sent to count method");
        }

        return this
            ._generateWhereClause(params)
            .count();
    }

    remove (params) {
        if (!params) {
            return new Error("No query params sent to remove method");
        }

        return this
            ._generateWhereClause(params)
            .del();
    }

    update (params, values) {
        if (!params) {
            return new Error("No query params sent to update method");
        }

        return this
            ._generateWhereClause(params)
            .update(values);
    }

    save (item) {
        if (!item) {
            return new Error("No query params sent to save method");
        }

        return this
            .getQueryBuilder()
            .insert(item)
            .then((result) => {
                item.id = result.pop();
            });
    }

    bulkInsertUpdate (data) {
        var origdata = data;
        let columns =  _.keys(data[0]);

        data = _(data).map((item) => {
            return _.values(_mapData(item));
        });

        let updates = columns.map((column) => {
            return column + " = VALUES(" + column + ")";
        });

        let sql = "INSERT IGNORE INTO ?? (??) VALUES ? ON DUPLICATE KEY UPDATE " + updates.join(", ");

        return this.knex.raw(sql, [this.tableName, columns, data])
            .catch((e) => {
                console.log(origdata,e);
            });
    }
}

module.exports = Base;