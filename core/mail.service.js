class Mailer {
    private transporter;

    private static ACTIVATION_EMAIL_TITLE = 'MS3 Activation Link';
    private static ACTIVATE_PAGE_URI = '/account/activate?token=';

    constructor(nodemailer, tokenizer, secret, CONFIG) {
        this.tokenizer = tokenizer;
        this.CONFIG = CONFIG;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ms3.cs506@gmail.com',
                pass: secret.gmailpass
            }
        })
    }

    sendActivationLink(req, res) {
        const token = this.jwt.sign({
           data: res.locals.activationData
        });
        const activationLink = this.getActivationLink(token);
        const mailOptions = {
            from: this.CONFIG.MAILER.FROM,
            to: res.locals.activationData.email,
            subject: this.ACTIVATION_EMAIL_TITLE,
            text: 'Thank you for signing up with UW-Madison Students ' +
            'and Scholars Sublease. Please click the following link to ' +
            'activate your account. ' + activationLink +
            ' The activation link will expire in 1 hour.'
        };

        this.transporter.sendMail(mailOptions, function (error, info) {
           if (error) {
               // I think this needs to go into a transaction so that on mailer failure datastore save can be rolled back
               errorResponse.send(res, 500, 'Internal Server Error');
           } else {

               res.status(201).json({message: 'Created'});
           }
        });
    }

    private getActivationLink(token) {
        let url = this.CONFIG.WEB_URL;
        url += this.ACTIVATE_PAGE_URI;
        url += token;

        return url;
    }
}

module.exports = Mailer;