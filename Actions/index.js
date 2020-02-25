const Errors = require("../Errors");

class Index
{
    constructor (container) {
        this.container = container;
    }

    registerAction (method, path, action) {
        this.container.get("dispatcher.api").registerAction(method, path, action);
    }

    forward404 (message) {
        throw new Errors.NotFoundException(this.get404Message(message));
    }

    get404Message (message) {
        return message || "resource could not be found";
    }

    forward404Unless (condition) {
        if (!condition) {
            this.forward404();
        }
    }

    /**
     *
     * @returns {Container}
     */
    getContainer () {
        return this.container;
    }

    get (service) {
        return this.getContainer().get(service);
    }
}


module.exports = Index;
