//  controllers/handleTokens.js

const jwt = require('jsonwebtoken');
const config = require('../config/config');

const createToken = (user) => {
    return jwt.sign({ 
        user,
        domain: 'jwtmongo.ru',
        path: '/'
    }, config.tPhrase, {
        expiresIn: config.tenMinutes
    });
}

const createRefreshToken = (email) => {
    return jwt.sign({ 
        email,
        domain: 'jwtmongo.ru',
        path: '/'
    }, config.rtPhrase, {
        expiresIn: config.aMonth
    });
}

module.exports = { createRefreshToken, createToken };
