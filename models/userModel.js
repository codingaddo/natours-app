const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must have minimum of 8 characters'],
    required: [true, 'Password is required'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      ///This only works on save() and creat()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  phote: {
    type: String,
  },
});

//Encrpting Password
userSchema.pre('save', async function (next) {
  //Only run if password was modified
  if (!this.isModified('password')) return next();

  //Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined; //Delete the confirmPassword field
  next();
});

//Comparing passwords to sign users into the app
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
