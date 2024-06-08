const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

///Removing Unwated field names
const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined, pleases use /signup',
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

//Current User getting dat about him self
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
