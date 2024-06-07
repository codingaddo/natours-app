const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//Creating a Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

//Creating a user
exports.signup = catchAsync(async (req, res, next) => {
  //   const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    photo: req.body.photo,
  });

  createSendToken(newUser, 201, res);
});

//Login a use
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1)Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2)Check if user exist & password is correct. The + helps to select the field which was not selected
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3)If everything is okay, send token to client
  createSendToken(user, 200, res);
});

//A middleware to protect the tours from unauthorize access
exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  //2) Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exist', 401),
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  //Grant access to the rout
  req.user = currentUser;
  next();
});

//Restricting user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //Roles is an array which can be ['admin','lead-guide'] or role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

//Resetting user password 1
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  //2)Generate Random token
  let resetToken;
  resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3)Send it to use's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request to reset to set a new password to : ${resetURL}.\n If you didn't request for a reset password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    //Reseting the token and the expired properties when sendig email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      AppError('The was an error sending email. Try again later!', 500),
    );
  }
});

//Resseting user password 2
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update the changedPasswordAT property for the current user
  // user.changedPasswordAfter(Date.now() - 1000);

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

//Updating user password. For users who haven't forgotten thier password but wants to change it
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2)Check if the posted password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Incorrect password', 401));
  }

  //3)Update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  //3) Log the user in, send jwt
  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'Success',
  //   token,
  // });
});

// exports.signup = async (req, res, next) => {
//     try{
//         const newUser = await User.create(req.body);

//         res.status(201).json({
//             status: 'Success',
//             data: {
//                 user: newUser,
//             },
//         });
//     }catch(err){
//         res.status(400).json({
//             status: 'Fail',
//             message: err,
//         });
//     }
// };
