var nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'gnitramesh@gmail.com',
        pass: '9392309030'
    }
});

module.exports = {
    sendemail: function (toAddress, htmlMessage, subject, fromName, fromMail, callback) {
        var mailOptions = {
            to: toAddress,
            subject: subject,
            html: htmlMessage
        };
        var fromParam = '';
        if (fromName) {
            fromParam = '"' + fromName + '"';
        } else {
            fromParam = '"Rba Team"';
        }
        if (fromMail) {
            fromParam += ' <' + fromMail + '>';
        } else {
            fromParam += ' <support@rba.com>';
        }
        mailOptions['from'] = fromParam;
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, info);

            }
        });
    }
}