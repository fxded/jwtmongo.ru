// controllers/fileController

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
    if (err) {
        errors.err = err;
    }
    
    return errors;
}


module.exports.fileUpload_post = async (req, res) => {
    const   user        = res.locals.user,
            dataFile    = req.files.file,
            filePath    = __dirname.split('/').slice(0,4).join('/')
                        + '/userdata/'
                        + user._id 
                        +'/';
    let updatedUser;
    
    try {
        if (!fs.existsSync(filePath)){
            const dir = await fs.promises.mkdir(filePath);
            console.log(filePath, 'created---------------- success')
        }
        const userFile = await dataFile.mv(filePath + dataFile.name);
        const userMongo = await User.findById(user._id);
        console.log('******',userMongo.userfiles.filter(item => item.name == dataFile.name));
        userMongo.userfiles.push({
            name    : dataFile.name,
            ext     : dataFile.name.split('.').pop(),
            mime    : dataFile.mimetype,
            size    : dataFile.size,
            data    : new Date()
        });
        updatedUser = await userMongo.save();
        console.log('---mongoUser', updatedUser);
        //res.writeHead(303, { Connection: 'close', Location: '/' });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.error('----uploaderr',err);
    }
    
    console.log('----uploads files', dataFile, user._id, filePath);
    res.status(200).json({ list: updatedUser.userfiles });
    //res.render('profile');
    //res.end()
}

module.exports.fileUpdate_put = async (req, res) => {
    const   dataFile    = req.files.file,
            filePath    = __dirname.split('/').slice(0,4).join('/')
                        + '/userdata/'
                        + res.locals.user._id 
                        +'/';
    let     userMongo;
    
    try {
        await dataFile.mv(filePath + dataFile.name);
        const updFileList = res.locals.user.userfiles.map(item => {
            if (item._id === req.params.id) {
                item.size = dataFile.size;
                item.mime = dataFile.mimetype;
                item.data = new Date();
                console.log('--updateFileINARR', item);
            }
            return item;
        });
        const userMongo = await User.findById(res.locals.user._id);
        userMongo.userfiles = updFileList;
        updatedUser = await userMongo.save();
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.error('----updateFileErr',err);
    }
    console.log('---fileUpdate',req.params.id, req.files.file);
    res.send({  
        id: req.params.id,
        user: updatedUser._id,
        list: updatedUser.userfiles
    });
    res.end();
}

module.exports.filesList_get = async (req, res) => {
    let user;
    
    try {
        user = await User.findById(res.locals.user._id);
        
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.error('----filesList_getError',err);
    }
    console.log('----get list of files', user.userfiles);
    res.status(200).json({ list: user.userfiles });
    
}
