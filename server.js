const mongoose = require('mongoose');

const dotenv = require('dotenv');

//Handling UncaughtException
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception');
  console.log(err.name, err.message);
  //Stopping the app from running
  process.exit(1);
});

dotenv.config({ path: './config.env' }); //To include development env files/ variables
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

//Handling unhandled promises such as fail to connect with the database
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection shutting down');
  console.log(err.name, err.message);
  //Stopping the app from running
  server.close(() => {
    process.exit(1);
  });
});

console.log(process.env.NODE_ENV);
