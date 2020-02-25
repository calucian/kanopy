const Actions = require("../Actions/index");

class TestAction extends Actions {

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
