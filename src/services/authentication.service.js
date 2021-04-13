const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { cleanData } = require('../utils');
const config = require('../config');
const User = require('../pg/models/Users');
const Token = require('../pg/models/Tokens');
const sendGrid = require('@sendgrid/mail');
const aws_url = process.env.IMAGE_URL;
const logo = `${aws_url}/avenidaz.png`;
const Hashids = require('hashids/cjs')
const hashids = new Hashids()
const moment = require('moment');

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

            const token = jwt.sign({id: user.id, type: user.userRole}, config.authentication.authToken);
            
            return { status: true, message: "Login successful", user: user, authorization: token };

        } catch(err) {
            return { code: 500, status: false, message: "Unable to find user" }
        }
    } else {
        return { code: 500, status:false, message: 'Email required and password' }
    }
}

const requestPasswordReset = async (req, email) => {
    const user = await User.findOne({where: {email: email}});
    const mainUrl = req.headers.referer;
    if (!user) {
        return { code: 500, status: false, message: "Usuario invalido" }
    }

    const tokenFound = await Token.findOne({ where: {userId: user.id }});
    if (tokenFound) { 
        await Token.destroy({ where: { userId: user.id } });
    };
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 10);

    const tokenEntry = {
        userId: user.id,
        token: hash,
        createdAt: Date.now(),
    }

    const createToken = await Token.create(tokenEntry);

    if (createToken) {
        const encodeId = hashids.encode(user.id);
        const params = `auth=${resetToken}&key=${encodeId}`;
        const link = `${mainUrl}resetpassword?${params}`;
    
        return sendGrid.send({
            to: email, // Change to your recipient
            from: config.email.noReply, // Change to your verified sender
            subject: `Hola ${user.first_name}! restablezca tu contraseña`,
            html: `
                <p>
                <img src="${logo}" width="300" />
                </p>
                <p>Has recibido este email porque hemos recibido una solicitud para restablecer tu contraseña</p>
                <p><a href='${link}'>Restablezca tu contraseña</a></p>
            `,
        }).then(() => {
            return true;
        })
        .catch(() => {
            return true;
        })
    } else {
        return false;
    }
}

const resetPassword = async (req) => {
    const body = req.body;
    const decodeUserId = hashids.decode(body.key);
    const tokenFound = await Token.findOne({ userId: decodeUserId });

    if (!tokenFound || !body.password || !decodeUserId) {
        return { code: 500, status: false, message: "Invalid token" }
    }

    const user = await User.findOne({where:{ id: tokenFound.user}});

    const today = new Date();

    if (!user) {
        return { code: 500, status: false, message: "Usuario invalido" }
    }

    const isAfter = moment(today).isAfter(tokenFound.createdAt, 'day');

    if (isAfter) {
        await Token.destroy({ where: { userId: user.id } });
        return { code: 500, status: false, message: "Token invalido" }
    }

    const tokenMatch = await bcrypt.compare(body.auth, tokenFound.token);

    if (!tokenMatch) {
        return { code: 500, status: false, message: "Invalid token" }
    }

    const hash = await bcrypt.hash(body.password, 10);

    const result = await User.update({
            password: hash
        }, 
        {
            where: { id: user.id }
        }
    );

    if (result) {
        await Token.destroy({ where: { userId: user.id } });

        return sendGrid.send({
            to: user.email, // Change to your recipient
            from: config.email.noReply, // Change to your verified sender
            subject: `Hola ${user.first_name}! su contraseña ha sido restablecida`,
            html: `
                <p>
                <img src="${logo}" width="300" />
                </p>
                <p>Has recibido este email porque su contraseña ha sido actualizada</p>
            `,
        }).then(() => {
            return true;
        })
        .catch(() => {
            return true;
        })
    } else {
        return false;
    }
}

module.exports = {
    authenticate,
    requestPasswordReset,
    resetPassword
}