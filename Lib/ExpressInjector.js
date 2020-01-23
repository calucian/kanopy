class ExpressInjector
{
    constructor (service) {
        this.service = service;
    }

    inject (express) {
        this.service(express);
    }
};

module.exports = ExpressInjector;