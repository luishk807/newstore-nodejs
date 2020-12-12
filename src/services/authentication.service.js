const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanData } = require('../utils');
const config = require('../config');
const User = require('../pg/models/Users');

const authenticate = async (email, password, onlyAdmin = false) => {
    const cleanEmail = cleanData(email);
    if (cleanEmail && password) {
        try {
            const credentialsNotMatchRetVal = { code: 401, status: false, message: 'Credentials do not match' };
            const user = await User.findOne({ where: { email: cleanEmail } });
            
            if (!user) {
                return credentialsNotMatchRetVal;
            }

            const pwdMatch = await bcrypt.compare(password, user.dataValues.password);
            if (!pwdMatch) {
                return credentialsNotMatchRetVal;
            }

            if (onlyAdmin && user.dataValues.userRole != 1) {
                return { code: 401, status: false, message: "Only Admins allowed"};
            }

            const token = jwt.sign({id: user.id}, config.authentication.authToken);
            
            return { status: true, message: "Login successful", user: user, authorization: token };

        } catch(err) {
            return { code: 500, status: false, message: "Unable to find user" }
        }
    } else {
        return { code: 500, status:false, message: 'Email required and password' }
    }
}

module.exports = {
    authenticate
}