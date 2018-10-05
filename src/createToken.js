var jwt = require('jsonwebtoken');
module.exports = {
    generateToken(tokenData, cb) {
        jwt.sign({
            data: tokenData
        }, 'test@123', { expiresIn: 6000 * 6000 }, function (err, token) {
            if (token) {
                // res.header('token', token);
                cb(null, token);
            } else {
                cb(err, null)
            }
        });
    },
    validateToken(token, cb) {
        try {
            jwt.verify(token, 'test@123', function (err, decoded) {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, decoded);
                }
            });
        } catch (err) {
            console.error('Error in CommonSRVC - tokenValidation: ', err);
            return cb(err, null);
        }
    },
}