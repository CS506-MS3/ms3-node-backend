class Tokenizer {
    constructor(jwt, secret, CONFIG) {
        this.jwt = jwt;
        this.secret = secret;
        this.CONFIG = CONFIG;
    }

    tokenize(data, expiry) {
        return jwt.sign(
            {
                data: data
            },
            this.secret.token_secret,
            {
                expiresIn: expiry
            }
        );
    }
}

module.exports = Tokenizer;