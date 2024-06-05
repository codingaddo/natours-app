const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //To include development env files
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
  .then(() => console.log('DB connection successful'))

const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

