const Actions = require("../Actions/index");

class TestAction extends Actions {

    constructor(container) {
        super(container);

        this.indexController.bind(this);

        this.registerAction("GET", "/test/test", this.indexController);
        this.registerAction("POST", "/test/test", this.indexController);
    }

    /**
     * @apiType GET
     * @apiPath /test
     *
     * @param req
     * @param res
     * @constructor
     */
    indexController (req, res) {
        res.send({
            a: "It Works !"
        });
    }
}

module.exports = TestAction;
