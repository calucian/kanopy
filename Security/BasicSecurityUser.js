

class BasicSecurityUser
{
    constructor (storage) {
        this.storage = storage;

        this.sessionId = null;
        this.authenticated = false;
        this.credentials = [];
    }

    async loadAttributes (sessionID) {
        this.sessionId  = sessionID;
        this.attributes = await this.storage.getAttributes(sessionID);
    }

    regenerate () {
        this.storage.regenerate(this.attributes, this.sessionID);
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

    addCredentials (credentials) {
        let added = false;

        credentials.forEach((credential) => {
            if (this.credentials.indexOf(credential) === -1) {
                return;
            }

            this.credentials.push(credential);
            added = true;
        });

        if (added) {
            this.regenerate();
        }
    }

    removeCredential (credential) {
        if (this.hasCredential(credential)) {
            this.credentials.splice(this.credentials.indexOf(credential), 1);

            this.regenerate();
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

    setAuthenticated (authenticated)
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

            this.regenerate();
        }
    }
}

module.exports = BasicSecurityUser;