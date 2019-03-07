const Actions = require("../Actions/index");

class TestAction extends Actions {
    /**
     *
     * @route ("/test", name="blog", method = "GET")
     * @route ("/test/:id", name="blog_list", method = "GET")
     *
     * @param req
     * @param res
     * @constructor
     */
    IndexController (req, res) {

    }
}

module.exports = TestAction;