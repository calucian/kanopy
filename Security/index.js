class Security
{
    constructor(provider) {
        this.provider = provider;
    }

    getUser () {
        return this.provider.getUser();
    }

    IsGranted () {
        return
    }
}

module.exports = Security;