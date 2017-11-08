module.exports = (function (nodemailer, tokenizer, secret, CONFIG) {
    'use strict';

    const ACTIVATION_EMAIL_TITLE = 'MS3 Activation Link';
    const ACTIVATE_PAGE_URI = '/account/activate?token=';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ms3.cs506@gmail.com',
            pass: secret.gmailpass
        }
    });

    function sendActivationLink(req, res) {
        const token = tokenizer.tokenize(res.locals.activationData, CONFIG.TOKEN_CONFIG.ACTIVATION_LINK_EXPIRY);
        const activationLink = getActivationLink(token);
        const mailOptions = {
            from: CONFIG.MAILER.FROM,
            to: res.locals.activationData.email,
            subject: ACTIVATION_EMAIL_TITLE,
            text: 'Thank you for signing up with UW-Madison Students ' +
            'and Scholars Sublease. Please click the following link to ' +
            'activate your account. ' + activationLink +
            ' The activation link will expire in 1 hour.'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                // I think this needs to go into a transaction so that on mailer failure datastore save can be rolled back
                errorResponse.send(res, 500, 'Internal Server Error');
            } else {

                res.status(201).json({message: 'Created'});
            }
        });
    }

    function getActivationLink(token) {
        let url = CONFIG.WEB_URL;
        url += ACTIVATE_PAGE_URI;
        url += token;

        return url;
    }

    return {
        sendActivationLink
    };
});
