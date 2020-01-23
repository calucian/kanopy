

class BasicSecurityUser
{
    constructor (storage) {
        this.storage = storage;

        this.sessionId = null;
        this.authenticated = false;
        this.credentials = [];
        this.attributes = {};
    }

    async loadAttributes (sessionID) {
        this.sessionId  = sessionID;
        this.attributes = await this.storage.getAttributes(sessionID);
    }

    async regenerate () {
        await this.storage.regenerate({
            attributes: this.attributes,
            authenticated: this.authenticated,
            credentials: this.credentials
        }, this.sessionId);
    }

    setAttribute (attribute, value) {
        this.attributes[attribute] = value;

        return this.regenerate();
    }

    getAttribute (attribute, defaultValue = null) {
        return this.attributes.hasOwnProperty(attribute) ? this.attributes[attribute] : value;
    }

    clearAttributes () {
        this.attributes = {};
    }


    hasCredential (credentials, useAnd = false) {
        if (!this.credentials) {
            return false;
        }

        if (!Array.isArray(credentials)) {
            return this.credentials.indexOf(credentials) !== -1;
        }

        let test = false;
        credentials.some((credential) => {
            test = this.hasCredential(credential, !useAnd);

            if (useAnd) {
                test = !test;
            }

            return test;
        });

        if (useAnd) // in AND mode we succeed if $test is false
        {
            test = !test;
        }

        return test;
    }

    async addCredentials (credentials) {
        let added = false;

        credentials.forEach((credential) => {
            if (this.credentials.indexOf(credential) === -1) {
                return;
            }

            this.credentials.push(credential);
            added = true;
        });

        if (added) {
            await this.regenerate();
        }
    }

    async removeCredential (credential) {
        if (this.hasCredential(credential)) {
            this.credentials.splice(this.credentials.indexOf(credential), 1);

            await this.regenerate();
        }
    }

    clearCredentials () {
        this.credentials = [];
    }

    isSuperAdmin () {
        return this.attributes.is_super_admin;
    }

    isAnonymous () {
        return this.authenticated ? 0 : 1;
    }

    isAuthenticated () {
        return this.authenticated;
    }

    async setAuthenticated (authenticated)
    {
        // @TODO add logging

        if (authenticated !== this.authenticated)
        {
            if (authenticated === true)
            {
                this.authenticated = true;
            }
            else
            {
                this.authenticated = false;
                this.clearCredentials();
            }

            // @TODO add logging

            await this.regenerate();
        }
    }
}

module.exports = BasicSecurityUser;