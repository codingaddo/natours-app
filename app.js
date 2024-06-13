const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression')
const morgan = require('morgan'); //Third party middleware
const app = express();
app.set('view engine', 'pug'); //A view engine for creating templates to display the results of query
app.set('views', path.join(__dirname, 'views'));
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//GLOBAL MIDDLEWARE
//Security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true })); //Getting data from a html form directly
app.use(cookieParser());

//Data Sanitization against NoSQL injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      ' maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression())
//Serving static files
// app.use(express.static(`${__dirname}/public`)); //reading a static file
app.use(express.static(path.join(__dirname, 'public'))); //reading a static file

//Test  middleware
app.use((req, res, next) => {
  // console.log('hello from the middleware');
  req.requesTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

////Mounting routers ///
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Handling unhandled routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'Fail';
  // err.stack = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

//Global Error handling
// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
//   next();
// });

module.exports = app;
