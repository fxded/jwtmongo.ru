// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createRefreshToken, createToken } = require('../controllers/handleTokens');
const config = require('../config/config');


const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  const refToken = req.cookies.reftk;

  console.log('----requireAuth');
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, config.tPhrase, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        res.locals.user = decodedToken.user;
        console.log(decodedToken);
        next();
      }
    });
  } else if (refToken) {
      try {
          const decodedRefToken = await jwt.verify(refToken, config.rtPhrase);
          const user = await User.findOne({ email: decodedRefToken.email });
          //console.log('----test1', user, refToken, config.tPhrase);
          if (user.reftoken === refToken) {
            const reftoken = await createRefreshToken({user});
            const token = await createToken(user);
            res.cookie('jwt', token, { httpOnly: true, maxAge: config.tenMinutes });
            res.cookie('reftk', reftoken, { httpOnly: true, maxAge: config.aMonth * 10000 });
            res.locals.user = user;
            const freshUser = await User.findByIdAndUpdate(
                { _id: user._id },
                { $set : { reftoken }}
            );
            next();
          } else {
              res.redirect('/login');
          }
      } catch (err) {
        console.log('\n----updateTokenError', err);
      }
      //const decodedRefToken = await jwt.verify(refToken, config.rtPhrase);
  }else {
    res.redirect('/login');
  }
  console.log('----------reqAuthEnd');
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  const refToken = req.cookies.reftk;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, config.tPhrase, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log('---decodedToken', decodedToken);
        try {
            let user = await User.findById(decodedToken.user.id);
            res.locals.user = user;
            const decodedRefToken = await jwt.verify(refToken, config.rtPhrase);
            console.log('---decodedRefToken:', decodedRefToken);
        } catch (err) {
            console.log('----checkUserError', err);
        }
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
