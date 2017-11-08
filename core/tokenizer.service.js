class Tokenizer {
    constructor(jwt, secret, CONFIG) {
        this.jwt = jwt;
        this.secret = secret;
        this.CONFIG = CONFIG;
    }

    tokenize(data, expiry) {
        return this.jwt.sign(
            {
                data: data
            },
            this.secret.token_secret,
            {
                expiresIn: expiry || this.CONFIG.TOKEN_CONFIG.DEFAULT_EXPIRY
            }
        );
    }
}

module.exports = Tokenizer;