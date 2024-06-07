const User = require('../models/userModel');
const AppError = require('../utils/appError');

///Removing Unwated field names
const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const catchAsync = require('../utils/catchAsync');
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  //Send Response
  res.status(200).json({
    status: 'success',
    requestedAt: req.requesTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route have not been defined yet',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route have not been defined yet',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route have not been defined yet',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route have not been defined yet',
  });
};

///Current users updating their data
exports.updateMe = catchAsync(async (req, res, next) => {
  //1)Create Error if user posts  password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password update please use updateMyPassword rout',
        400,
      ),
    );
  }

  //2) Filtered out unwanted fields names that are not allowed to be changed
  const filteredBodyRequest = filterObj(req.body, 'name', 'email');
  //3) Update user data
  const Udateduser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBodyRequest,
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      user: Udateduser,
    },
  });
});

//Current User deleting their account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
