const Actions = require("../Actions/index");

class TestAction extends Actions {
    /**
     *
     * @Route ({pattern: "/test", id: "log", methods: "GET"})
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