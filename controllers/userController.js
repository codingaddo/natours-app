const User = require('../models/userModel');
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
