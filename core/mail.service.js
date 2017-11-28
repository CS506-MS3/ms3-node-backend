module.exports = (function (nodemailer, tokenizer, secret, CONFIG) {
    'use strict';

    const ACTIVATION_EMAIL_TITLE = 'MS3 Activation Link';

    const ACTIVATE_PAGE_URI = '/#/account/activate?token=';
    const SUBSCRIPTION_CANCEL_TITLE = 'Your MS3 Account Subscription Has Been Cancelled';
    const RESET_PASSWORD_URI = '/#/reset-password?token=';
    const ACCOUNT_INFO_CHANGE_TITLE = 'Your MS3 Account Info Has Been Changed'
    const ACCOUNT_PASSWORD_CHANGE_TITLE = 'Your MS3 Account Password Has Been Changed'
    const RESET_PASSWORD_TITLE = 'MS3 Password Change Request'

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

    function sendAccountInfoChangeNotification(req, res) {
        const mailOptions = {
            from: CONFIG.MAILER.FROM,
            to: res.locals.userData.email,
            subject: ACCOUNT_INFO_CHANGE_TITLE,
            text: "Hi\n\nOur records indicate that you recently changed your account information.\n\nIf this wasn’t you, please contact our Customer Service as soon as possible."
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                errorResponse.send(res, 500, 'Internal Server Error');
            } else {
                res.status(200).json({message: 'Updated'});
            }
        });
    }

    function sendSubscriptionCancelNotification(req, res) {
        const mailOptions = {
            from: CONFIG.MAILER.FROM,
            to: res.locals.email,
            subject: SUBSCRIPTION_CANCEL_TITLE,
            text: "Hi\n\nOur records indicate that you recently cancelled your " + req.body.type.toLowerCase() + " subscription.\n\nIf this wasn’t you, please contact our Customer Service as soon as possible."
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                errorResponse.send(res, 500, 'Internal Server Error');
            } else {
                if (res.locals.auth_token !== undefined) {
                    res.status(200).json({message: 'Updated', token: res.locals.auth_token});
                } else {
                    res.status(200).json({message: 'Updated'});
                }
            }
        });
    }
      
    function sendPasswordChangeNotification(req, res) {
        const mailOptions = {
            from: CONFIG.MAILER.FROM,
            to: res.locals.userData.email,
            subject: ACCOUNT_PASSWORD_CHANGE_TITLE,
            text: "Hi\n\nOur records indicate that you recently changed your account password.\n\nIf this wasn’t you, please contact our Customer Service as soon as possible."
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                errorResponse.send(res, 500, 'Internal Server Error');
            } else {
                if (res.locals.auth_token !== undefined) {
                    res.status(200).json({message: 'Updated', token: res.locals.auth_token});
                } else {
                    res.status(200).json({message: 'Updated'});
                }
            }
        });
    }

    function sendPasswordResetLink(req, res) {
        const resetPasswordLink = CONFIG.WEB_URL + RESET_PASSWORD_URI + res.locals.token;
        const mailOptions = {
            from: CONFIG.MAILER.FROM,
            to: res.locals.userData.email,
            subject: RESET_PASSWORD_TITLE,
            text: 'Please click the following link to activate your account. ' + 
            resetPasswordLink + ' The activation link will expire in 1 hour.'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                errorResponse.send(res, 500, 'Internal Server Error');
            } else {
                res.status(200).json({message: 'Success'});
            }
        });
    }
  
    return {
        sendActivationLink,
        sendAccountInfoChangeNotification,
        sendSubscriptionCancelNotification,
        sendPasswordChangeNotification,
        sendPasswordResetLink
    };
});
