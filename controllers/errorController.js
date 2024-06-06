const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFielDB = (err) => {
  const msg = err.errmsg;
  const message = `Duplicate field value of ${msg} , please use another value`;
  return new AppError(message, 400);
};

const handleJwtError = (err) =>
  new AppError('Invalid Token. Please log in again', 401);

const handleJwtExpiredToken = (err) =>
  new AppError('Your Token has expired login again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational error, send message to client

  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or any unknown error
  } else {
    console.error('Error 💥', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error && error.name === 'CastError') error = handleCastErrorDB(error);
    if (error && error.code === 11000) error = handleDuplicateFielDB(error);

    if (error && error.name === 'JsonWebTokenError')
      error = handleJwtError(error);

    if (error && error.name === 'TokenExpiredError')
      error = handleJwtExpiredToken(error);

    sendErrorProd(error, res);
  }

  // next();
};
