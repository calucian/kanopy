class Memory {
    constructor () {
        this.values = {};
    }

    getAttributes (sessionID) {
        return this.values[sessionID];
    }

    regenerate (attributes, sessionID) {
        this.values[sessionID] = attributes;
    }
}

module.exports = Memory;