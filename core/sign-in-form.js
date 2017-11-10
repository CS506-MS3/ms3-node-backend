module.exports = (function () {
    'use strict';

    class SignInForm {
        constructor(body) {
            this.email = body.email;
            this.password = body.password;
        }

        isValid() {

            return this.email !== undefined && this.password !== undefined;
        }
    }

    return SignInForm;
})();