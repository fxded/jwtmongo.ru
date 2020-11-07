// models/User

const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

// create fileInfo Schema
const FileInfoSchema = new mongoose.Schema({
    userFiles: [{
        name: String,
        ext: String,
        mime: String,
        size: Number,
        data: Date
    }]
});

// create user Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    //validate: [(val) => { }, 'Please enter a valid email']
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter an password'],
    minlength: [6, 'Minimum password length is 6 character']
  },
  reftoken: {
      type: String
  },
  userfiles: FileInfoSchema
});

// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//static method to login user
userSchema.statics.login = async function(email, password, reftoken) {
    const user = await this.findOneAndUpdate(
        { email },
        { $set : { reftoken }},
        {}
    );
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

//static method to logout user
userSchema.statics.logout = async function(_id) {
    const user = await this.findByIdAndUpdate(
        { _id },
        { $set : { reftoken: '' }}
    );
    if (!user) {
        throw Error('Wrong user');
    } else {
        console.log(`${user.email} logout`);
    }
}

const User = mongoose.model('user', userSchema);


module.exports = User;
