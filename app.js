const express = require('express');

const morgan = require('morgan'); //Third party middleware

const app = express();

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

//Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); //reading a static file

//Creating a custom middleware
app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

app.use((req, res, next) => {
  console.log('hello from the middleware');
  req.requesTime = new Date().toISOString();
  next();
});

////Mounting routers ///
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
