const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    minlength: [8, 'Password must have a minimum of 8 characters'],
    required: [true, 'Password is required'],
    select: false, // Do not return password by default
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on save() and create()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
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

//Update passwordChangeAt field after updating your password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Comparing password in database to the posted password to sign users into the app
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Checking if user changed his password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(changeTimeStamp, JWTTimestamp);
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};

///Not showing list of inactive users
//The is a query middleware and it points to the current query
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//creating a token for password reset
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
