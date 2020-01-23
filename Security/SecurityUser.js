const BasicSecurityUser = require('./BasicSecurityUser');

class SecurityUser extends BasicSecurityUser {
    constructor (storage, userProvider, sessionID) {
        super(storage, sessionID);

        this.userProvider = userProvider;
    }

    async getGuardUser () {
        let id = this.getAttribute("user_id");

        this.user = this.userProvider.find(id);
    }

    async signIn (user) {
        user.lastLogin = new Date();
        await user.save();

        this.setAttribute("user_id", user.id);
        this.setAuthenticated(true);
        this.addCredentials(await user.getAllPermissionNames());
    }

    async signOut () {
        this.attributes.securityUser = null;
        this.user = null;
        this.clearCredentials();
        await this.setAuthenticated(true);
    }
}