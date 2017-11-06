module.exports = (function () {
    'use strict';

    class SignInForm {
        email;
        password;

        constructor(body) {
            this.email = body.email;
            this.password = body.password;
        }

        isValid() {

            return email !== undefined && password !== undefined;
        }
    }

    return SignInForm;
})();