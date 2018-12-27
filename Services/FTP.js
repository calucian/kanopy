"use strict";

var Client = require("ftp");

/**
 * Wrapper service for node-ftp
 *
 * @see https://github.com/mscdex/node-ftp
 */
class FTP
{
    /**
     * Init the FTP client
     *
     * @param host
     * @param port
     * @param user
     * @param password
     */
    constructor (host, port, user, password) {
        this.client = new Client();

        this.config = {
            host:     host,
            port:     port,
            user:     user,
            password: password
        };
    }

    /**
     * Connect to FTP server
     *
     * @param callback
     */
    connect (callback) {
        this.client.connect(this.config);

        this.client.on("ready", () => {
            callback();
        });

        this.client.on("error", (err) => {
            callback(err);
        });
    }

    /**
     * List the contents of a remote FTP directory
     *
     * @param remotePath
     * @param callback
     */
    lsDir (remotePath, callback) {
        this.client.list(remotePath, callback);
    }

    /**
     * Get a file from a remote FTP destination
     *
     * @param remotePath
     * @param callback
     */
    get (remotePath, callback) {
        this.client.get(remotePath, callback);
    }

    /**
     * Upload file/stream to FTP server
     *
     * @param path
     * @param dest
     * @param callback
     */
    put (path, dest, callback) {
        this.client.put(path, dest, callback);
    }

    /**
     * Rename a file on the remote host
     *
     * @param oldPath
     * @param newPath
     * @param callback
     */
    rename (oldPath, newPath, callback) {
        this.client.rename(oldPath, newPath, (err) => {
            return callback(err);
        });
    }

    /**
     * Delete file on remote host
     *
     * @param path
     * @param dest
     * @param callback
     */
    delete (path, callback) {
        this.client.delete(path, (err) => {
            return callback(err);
        });
    }

    /**
     * Make a directory on the remote host
     *
     * @param path
     * @param recursive
     * @param callback
     */
    mkdir (path, recursive, callback) {
        this.client.mkdir(path, recursive, (err) => {
            return callback(err);
        });
    }

    /**
     * Delete a directory on the remote host
     *
     * @param path
     * @param recursive
     * @param callback
     */
    rmdir (path, recursive, callback) {
        this.client.rmdir(path, recursive, (err) => {
            return callback(err);
        });
    }

    /**
     * Close ftp connection.
     */
    end () {
        this.client.end();
    }
}

module.exports = FTP;