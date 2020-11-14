//  controllers/authController.js

// controller actions
const   User    = require('../models/User');
const   jwt     = require('jsonwebtoken');
const   { createRefreshToken, createToken } = require('./handleTokens');
const   config  = require('../config/config');
const   fs      = require('fs');

//handle errors
const handleErrors = (err) => {
    //console.log(err.message, err.code);
    let errors = { email: '', password: ''};
    
    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }
    
    //duplicate error code
    if (err.code === 11000) {
        errors.email =  'that email is already registered';
        return errors;
    }
    
    //validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    
    return errors;
}

module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  
  try {
      const reftoken = await createRefreshToken(email);
      const user = await User.signup(email, password, reftoken);
      console.log('----signUp', user, reftoken);
      const token = await createToken(user);
      res.cookie('jwt', token, { httpOnly: true, maxAge: config.tenMinutes });
      res.cookie('reftk', reftoken, { httpOnly: true, maxAge: config.aMonth * 1000 });
      res.status(201).json({ user: user._id });
  }
  catch (err) {
      const errors = handleErrors(err);
      console.log(`--------createUserErr: ${JSON.stringify( errors )}, ${err}`);
      res.status(400).json({ errors });
  }
  console.log('---signUP:',email, password);
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  
  try{
      const reftoken = await createRefreshToken(email);
      const user = await User.login(email, password, reftoken);
      const token = await createToken(user);
      res.cookie('jwt', token, { httpOnly: true, maxAge: config.tenMinutes });
      res.cookie('reftk', reftoken, { httpOnly: true, maxAge: config.aMonth * 1000 });
      res.status(200).json({ user: user._id });
  } catch (err) {
      const errors = handleErrors(err);
      console.log(`--------loginUserErr: ${JSON.stringify( errors )}, ${err}`);
      res.status(400).json({ errors });
  }
}

module.exports.logout_get = async (req, res) => {
  const token = req.cookies.jwt;

  res.cookie('jwt', '', { maxAge: 1 });
  res.cookie('reftk', '', { maxAge: 1 });
  
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, config.tPhrase, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(decodedToken);
        try {
            let user = await User.logout(decodedToken.user._id);
        } catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
            console.log('----logoutUserError', err);
        }
      }
    });
  }
  res.redirect('/');
}

module.exports.info_get = async (req, res) => {
    const user = res.locals.user;
    console.log('---------reqGetInfo', user);
    res.status(200).json({ id:user.email });
}

