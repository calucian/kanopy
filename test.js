const { Container } = require("./index");
//const services = require("./src/Services/services");

const container = new Container();

container.get("config").set("app.basePath", __dirname);

container
    .get("dispatcher.api")
    .init(__dirname + "/Test/")
    .listen(3001);