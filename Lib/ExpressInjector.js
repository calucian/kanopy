module.exports.ExpressInjector =  class
{
    constructor (service) {
        this.service = service;
    }

    inject (express) {
        this.service(express);
    }
};
